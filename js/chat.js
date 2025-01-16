class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        
        // 添加聊天历史记录数组
        this.messageHistory = [
            {
                role: "system",
                content: "你是一位专业的中国法律顾问，熟悉中国现行法律法规。请基于准确的法律依据，为用户提供专业的法律建议。回答要简明扼要，并在必要时引用相关法条。"
            }
        ];
        
        // 修改 API 地址的获取方式，增加容错
        const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8081';
        this.apiEndpoint = `${API_BASE_URL}/api/chat`;
        
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // 输入框回车事件
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // 添加用户消息到界面
        this.addMessage('user', message);

        // 清空输入框
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // 禁用发送按钮
        this.sendButton.disabled = true;

        try {
            // 添加加载动画
            const loadingDiv = this.addLoadingAnimation();

            // 添加用户消息到历史记录
            this.messageHistory.push({
                role: "user",
                content: message
            });

            // 调用后端 API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: this.messageHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'API request failed');
            }

            const data = await response.json();
            
            // 移除加载动画
            loadingDiv.remove();

            // 获取 AI 回复
            const aiResponse = data.choices[0].message.content;
            
            // 添加 AI 回复到界面
            this.addMessage('assistant', aiResponse);

            // 添加 AI 回复到历史记录
            this.messageHistory.push({
                role: "assistant",
                content: aiResponse
            });

        } catch (error) {
            console.error('Error details:', error);
            this.addErrorMessage();
        } finally {
            // 启用发送按钮
            this.sendButton.disabled = false;
        }
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const formattedContent = content
            .replace(/\n+/g, '\n')
            .replace(/(\d+\.\s[^。\n]+[。]?)(?=\s*\d+\.|\s*$)/g, '$1\n')
            .replace(/\s+$/gm, '')
            .replace(/\n{3,}/g, '\n\n');
        
        messageDiv.textContent = formattedContent;
        this.chatMessages.appendChild(messageDiv);
        
        // 使用 requestAnimationFrame 确保在 DOM 更新后滚动
        requestAnimationFrame(() => {
            // 滚动到新消息
            messageDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest'
            });
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = "您好！我是您的AI法律助手。请问有什么法律问题需要咨询吗？";
        this.addMessage('assistant', welcomeMessage);
    }

    addLoadingAnimation() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'typing';
        loadingDiv.innerHTML = '<span></span><span></span><span></span>';
        this.chatMessages.appendChild(loadingDiv);
        
        // 滚动到加载动画
        requestAnimationFrame(() => {
            loadingDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest'
            });
        });
        
        return loadingDiv;
    }

    addErrorMessage() {
        this.addMessage('system', '抱歉，服务出现了一点小问题，请稍后重试。如果问题持续存在，请联系客服。');
    }
}

// 修改初始化方式
document.addEventListener('DOMContentLoaded', () => {
    // 确保配置已加载
    if (!window.APP_CONFIG) {
        console.warn('配置未加载，使用默认配置');
        window.APP_CONFIG = {
            API_BASE_URL: 'http://localhost:8081'
        };
    }
    
    // 初始化聊天界面
    const chatUI = new ChatUI();
}); 