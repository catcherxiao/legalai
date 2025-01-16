// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav-bar');
    if (window.scrollY > 0) {
        nav.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }
});

// 导航链接激活状态
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// 功能卡片点击事件
document.querySelectorAll('.feature-card button').forEach(button => {
    button.addEventListener('click', function() {
        const cardId = this.closest('.feature-card').id;
        switch(cardId) {
            case 'ai-qa':
                window.location.href = 'pages/ai-qa.html';
                break;
            case 'contract-analysis':
                window.location.href = 'pages/contract-analysis.html';
                break;
            case 'contract-gen':
                window.location.href = 'pages/contract-gen.html';
                break;
        }
    });
});

// 如果在功能卡片的整体区域也想要点击效果
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // 如果点击的不是按钮本身（避免触发两次）
        if (!e.target.matches('button')) {
            const cardId = this.id;
            switch(cardId) {
                case 'ai-qa':
                    window.location.href = 'pages/ai-qa.html';
                    break;
                case 'contract-analysis':
                    window.location.href = 'pages/contract-analysis.html';
                    break;
                case 'contract-gen':
                    window.location.href = 'pages/contract-gen.html';
                    break;
            }
        }
    });
});

// 在现有的 utils 对象中添加错误处理相关函数
window.utils = window.utils || {
    // 错误类型定义
    ErrorTypes: {
        NETWORK: 'NETWORK_ERROR',
        API: 'API_ERROR',
        FILE: 'FILE_ERROR',
        VALIDATION: 'VALIDATION_ERROR',
        UNKNOWN: 'UNKNOWN_ERROR'
    },

    // 错误处理函数
    handleError(error, type = 'UNKNOWN_ERROR') {
        console.error(`[${type}]`, error);

        // 根据错误类型显示不同的提示
        switch (type) {
            case 'NETWORK_ERROR':
                toast.error('网络连接失败，请检查网络后重试');
                break;
            case 'API_ERROR':
                toast.error(error.message || 'API 服务异常，请稍后重试');
                break;
            case 'FILE_ERROR':
                toast.warning(error.message || '文件处理失败，请重试');
                break;
            case 'VALIDATION_ERROR':
                toast.warning(error.message || '输入验证失败，请检查后重试');
                break;
            default:
                toast.error('操作失败，请重试');
        }

        // 记录错误日志
        this.logError(error, type);
    },

    // 错误日志记录
    logError(error, type) {
        const errorLog = {
            type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // 可以将错误日志发送到服务器
        console.log('Error Log:', errorLog);
    },

    // 输入验证
    validateInput(value, rules) {
        if (!rules) return true;

        for (const rule of rules) {
            if (rule.required && !value) {
                throw new Error(rule.message || '此项不能为空');
            }

            if (rule.minLength && value.length < rule.minLength) {
                throw new Error(rule.message || `长度不能少于 ${rule.minLength} 个字符`);
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                throw new Error(rule.message || `长度不能超过 ${rule.maxLength} 个字符`);
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                throw new Error(rule.message || '格式不正确');
            }
        }

        return true;
    },

    // 用户操作确认
    async confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-content">
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-buttons">
                        <button class="cancel-btn">${options.cancelText || '取消'}</button>
                        <button class="confirm-btn">${options.confirmText || '确定'}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const confirmBtn = modal.querySelector('.confirm-btn');
            const cancelBtn = modal.querySelector('.cancel-btn');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }
};

// 在使用功能前检查登录状态
function checkLoginBeforeUse(callback) {
    if (!window.authManager?.checkLogin()) {
        window.authManager?.showAuthModal();
        return false;
    }
    return callback();
}

// 在使用功能时调用
checkLoginBeforeUse(() => {
    // 功能代码
});

// 初始化功能按钮事件
document.addEventListener('DOMContentLoaded', () => {
    // 绑定功能卡片点击事件
    const aiQaCard = document.getElementById('ai-qa');
    if (aiQaCard) {
        const consultBtn = aiQaCard.querySelector('.primary-btn');
        if (consultBtn) {
            consultBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                // 检查是否登录
                if (!window.authManager?.checkLogin()) {
                    window.authManager?.showAuthModal();
                    return;
                }
                // 已登录，跳转到问答页面
                window.location.href = 'pages/ai-qa.html';
            });
        }
    }

    // 绑定其他功能卡片
    const contractAnalysisCard = document.getElementById('contract-analysis');
    if (contractAnalysisCard) {
        const analysisBtn = contractAnalysisCard.querySelector('.primary-btn');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!window.authManager?.checkLogin()) {
                    window.authManager?.showAuthModal();
                    return;
                }
                window.location.href = 'pages/contract-analysis.html';
            });
        }
    }

    const contractGenCard = document.getElementById('contract-gen');
    if (contractGenCard) {
        const genBtn = contractGenCard.querySelector('.primary-btn');
        if (genBtn) {
            genBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!window.authManager?.checkLogin()) {
                    window.authManager?.showAuthModal();
                    return;
                }
                window.location.href = 'pages/contract-gen.html';
            });
        }
    }
});