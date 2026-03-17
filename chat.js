const SUPABASE_URL = 'https://vnmolqkjfixoktvrddma.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gDv-OZwsV3lUnRMvrZ-GGA_LaiiVXFF';

const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 防御性工具函数
const $ = id => document.getElementById(id);
const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

window.ChatSystem = {
    roomCode: '',
    nickname: '',
    subscription: null,

    init() {
        if (!sbClient) {
            console.error("Supabase 加载失败，请检查脚本引用");
            return;
        }
        // 绑定按钮事件，增加 null 判断防止报错
        if ($('btnJoinChat')) $('btnJoinChat').onclick = () => this.join();
        if ($('btnSendMsg')) $('btnSendMsg').onclick = () => this.send();
        if ($('msgInput')) {
            $('msgInput').onkeydown = (e) => { 
                if (e.key === 'Enter') this.send(); 
            };
        }
    },

    async join() {
        this.roomCode = $('inputRoomCode').value.trim();
        this.nickname = $('inputNickname').value.trim();
        
        if (!this.roomCode || !this.nickname) {
            alert('请输入交流码和昵称');
            return;
        }

        // 1. 获取历史消息
        const { data, error } = await sbClient
            .from('messages')
            .select('*')
            .eq('room_code', this.roomCode) // 确保你按上方 SQL 运行了
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (error) {
            console.error("查询失败:", error.message);
            alert("进入失败: " + error.message);
            return;
        }

        // 切换界面
        $('chatLogin').classList.add('hidden');
        $('chatMain').classList.remove('hidden');
        $('chatMain').style.display = 'flex'; // 强制显示
        
        if (data) {
            $('chatBox').innerHTML = '';
            data.forEach(m => this.renderMsg(m));
        }

        // 2. 建立 Realtime 订阅
        if (this.subscription) sbClient.removeChannel(this.subscription);
        
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
    },

    async send() {
        const input = $('msgInput');
        const content = input.value.trim();
        if (!content) return;
        
        const { error } = await sbClient.from('messages').insert([{
            user_name: this.nickname, // 对应数据库字段 user_name
            content: content,
            room_code: this.roomCode // 对应数据库字段 room_code
        }]);

        if (!error) {
            input.value = '';
        } else {
            console.error("发送详情:", error);
            alert('发送失败: ' + error.message);
        }
    },

    renderMsg(m) {
        const isMe = (m.user_name === this.nickname);
        const div = document.createElement('div');
        div.className = `msg-row ${isMe ? 'me' : 'others'}`;
        
        // 修正字段名从 m.nickname 改为 m.user_name
        const sender = m.user_name || "匿名";
        const timeStr = m.created_at ? new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
        
        div.innerHTML = `
            <div class="msg-info">${sender} ${timeStr}</div>
            <div class="msg-bubble">${escapeHtml(m.content)}</div>
        `;
        
        const box = $('chatBox');
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }
};
