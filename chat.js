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
            console.error("❌ Supabase 未能加载，请检查 HTML 中的脚本引用");
            return;
        }
        console.log("✅ 聊天系统初始化成功");
        
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

        console.log(`正在加入房间: ${this.roomCode} ...`);

        // 1. 获取历史消息 (保持 room_code 过滤)
        const { data, error } = await sbClient
            .from('messages')
            .select('*')
            .eq('room_code', this.roomCode)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (error) {
            console.error("❌ 历史消息加载失败:", error.message);
            alert("进入失败: " + error.message);
            return;
        }

        // 切换界面
        $('chatLogin').classList.add('hidden');
        $('chatMain').classList.remove('hidden');
        $('chatMain').style.display = 'flex';
        
        if (data) {
            $('chatBox').innerHTML = '';
            data.forEach(m => this.renderMsg(m));
        }

        // 2. 建立 Realtime 订阅 (修正订阅逻辑)
        this.setupSubscription();
    },

    setupSubscription() {
        if (this.subscription) {
            sbClient.removeChannel(this.subscription);
        }

        console.log("📡 正在尝试开启实时订阅...");

        // 创建频道
        this.subscription = sbClient.channel(`room-${this.roomCode}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                // 如果实时不显示，通常是因为这里的 filter 匹配太死
                // 如果数据库 room_code 列有空格或大小写不一会失效
                filter: `room_code=eq.${this.roomCode}` 
            }, payload => {
                console.log("📩 收到实时消息:", payload.new);
                this.renderMsg(payload.new);
            })
            .subscribe((status) => {
                console.log("🌐 实时连接状态:", status);
                if (status === 'SUBSCRIBED') {
                    console.log("✅ 已成功链接到实时广播站");
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error("❌ 订阅失败，请确认数据库 Replication 是否开启");
                }
            });
    },

    async send() {
        const input = $('msgInput');
        const content = input.value.trim();
        if (!content) return;
        
        // 插入数据
        const { error } = await sbClient.from('messages').insert([{
            user_name: this.nickname, 
            content: content,
            room_code: this.roomCode 
        }]);

        if (error) {
            console.error("❌ 发送失败:", error);
            alert('发送失败: ' + error.message);
        } else {
            console.log("🚀 消息发送成功");
            input.value = '';
            // 注意：我们不需要在这里手动 renderMsg，因为实时订阅会自动帮我们渲染
        }
    },

    renderMsg(m) {
        // 关键修复：确保判断发送者时逻辑严密
        const sender = m.user_name || "匿名";
        const isMe = (sender === this.nickname);
        
        const div = document.createElement('div');
        div.className = `msg-row ${isMe ? 'me' : 'others'}`;
        
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
