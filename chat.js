// 注意：请将这里的 URL 和 KEY 替换为你 Supabase 控制台的真实数据
const SUPABASE_URL = 'https://vnmolqkjfixoktvrddma.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gDv-OZwsV3lUnRMvrZ-GGA_LaiiVXFF';

// 初始化客户端
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

window.ChatSystem = {
  roomCode: '',
  nickname: '',
  subscription: null,

  // 由 app.js 在启动时调用
  init() {
    if (!sbClient) {
      console.warn("Supabase 未能成功加载");
      return;
    }
    // 绑定内部聊天界面的事件
    $('btnJoinChat').onclick = () => this.join();
    $('btnSendMsg').onclick = () => this.send();
    $('msgInput').onkeydown = (e) => { 
      if (e.key === 'Enter') this.send(); 
    };
  },

  async join() {
    this.roomCode = $('inputRoomCode').value.trim();
    this.nickname = $('inputNickname').value.trim();
    
    if (!this.roomCode || !this.nickname) {
      showToast('请输入交流码和昵称');
      return;
    }

    // 切换界面状态
    $('chatLogin').classList.add('hidden');
    $('chatMain').classList.remove('hidden');
    
    // 1. 获取最近 50 条历史消息
    const { data, error } = await sbClient
      .from('messages')
      .select('*')
      .eq('room_code', this.roomCode)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) {
      $('chatBox').innerHTML = '';
      data.forEach(m => this.renderMsg(m));
    }

    // 2. 建立 Realtime 订阅 (核心)
    if (this.subscription) {
      sbClient.removeChannel(this.subscription);
    }
    
    this.subscription = sbClient.channel('room-' + this.roomCode)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_code=eq.${this.roomCode}` 
      }, payload => {
        this.renderMsg(payload.new);
      })
      .subscribe();

    showToast('已进入交流室: ' + this.roomCode);
  },

  async send() {
    const content = $('msgInput').value.trim();
    if (!content) return;
    
    // 这里的 key 必须和截图里的 Name 一致
    const { error } = await sbClient.from('messages').insert([{
      user_name: this.nickname, // 改 nickname 为 user_name
      content: content
      // 暂时删掉 room_code，因为你数据库里没这一列
    }]);
  
    if (!error) {
      $('msgInput').value = '';
    } else {
      showToast('发送失败');
      console.error(error);
    }
  }

  renderMsg(m) {
    const isMe = (m.nickname === this.nickname);
    const div = document.createElement('div');
    div.className = `msg-row ${isMe ? 'me' : 'others'}`;
    
    // 格式化时间 hh:mm
    const timeStr = new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    div.innerHTML = `
      <div class="msg-info">${m.nickname} ${timeStr}</div>
      <div class="msg-bubble">${escapeHtml(m.content)}</div>
    `;
    
    const box = $('chatBox');
    box.appendChild(div);
    // 自动滚动到底部
    box.scrollTop = box.scrollHeight;
  }
};
