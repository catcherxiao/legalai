class AIChat {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendBtn');
        
        // 添加聊天历史记录数组
        this.messageHistory = [
            {
                role: "system",
                content: "你是一位专业的中国法律顾问，熟悉中国现行法律法规。请基于准确的法律依据，为用户提供专业的法律建议。回答要简明扼要，并在必要时引用相关法条。"
            }
        ];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 发送按钮点击事件
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // 输入框回车事件
        if (this.userInput) {
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
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // 添加用户消息到界面
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // 创建AI回复消息容器
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message assistant';
        this.chatMessages.appendChild(aiMessageDiv);
        this.scrollToBottom();

        try {
            // 调用流式API
            await this.streamResponse(message, aiMessageDiv);
        } catch (error) {
            aiMessageDiv.textContent = '抱歉，服务出现了问题，请稍后再试。';
            console.error('API调用错误:', error);
        }
    }

    async streamResponse(message, messageDiv) {
        const API_KEY = 'sk-f9c07d63bfa145d7a01eab6bb375c8b6';
        const API_URL = 'https://api.deepseek.com/v1/chat/completions';
        
        try {
            // 添加用户消息到历史记录
            this.messageHistory.push({
                role: "user",
                content: message
            });

            const requestBody = {
                model: "deepseek-chat",
                messages: this.messageHistory,
                temperature: 0.7,
                max_tokens: 2000,
                stream: true
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let responseText = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;
                            
                            const data = JSON.parse(line.slice(6));
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                const content = data.choices[0].delta.content;
                                responseText += content;
                                messageDiv.textContent = responseText;
                                this.scrollToBottom();
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('JSON解析错误:', e, line);
                            }
                        }
                    }
                }
            }

            // 添加AI回复到历史记录
            this.messageHistory.push({
                role: "assistant",
                content: responseText
            });

            // 限制历史记录长度
            if (this.messageHistory.length > 10) {
                this.messageHistory = [
                    this.messageHistory[0],
                    ...this.messageHistory.slice(-8)
                ];
            }

        } catch (error) {
            console.error('流式API调用错误:', error);
            messageDiv.textContent = '抱歉，服务出现了问题，请稍后再试。';
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查用户是否已登录
    if (!window.authManager?.checkLogin()) {
        // 显示登录提示
        window.authManager?.showLoginTip();
        return;
    }
    new AIChat();
}); 