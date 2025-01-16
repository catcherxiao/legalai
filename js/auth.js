// 避免重复声明
if (!window.AuthManager) {
    // 使用全局配置
    const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8080';
    
    window.AuthManager = class AuthManager {
        constructor() {
            this.currentStep = 'phone'; // phone -> verify -> register
            this.phone = '';
            this.setupEventListeners();
            this.isSendingCode = false;
            // 添加登录状态管理
            this.isLoggedIn = false;
            this.userInfo = null;
        }

        showAuthModal() {
            try {
                // 添加模糊效果
                document.body.classList.add('modal-open');

                const modal = document.createElement('div');
                modal.className = 'auth-modal';
                modal.innerHTML = this.getModalContent();

                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.addEventListener('click', () => this.closeModal());

                document.body.appendChild(overlay);
                document.body.appendChild(modal);

                // 初始化阿里云验证码
                this.initAliCaptcha();
            } catch (error) {
                console.error('显示登录窗口失败:', error);
            }
        }

        getModalContent() {
            return `
                <div class="modal-header">
                    <h2>登录后<br>使用你的AI法律小助手</h2>
                </div>
                <div class="modal-body">
                    <form id="phoneForm" class="auth-form">
                        <div class="phone-group">
                            <div class="country-code">+86</div>
                            <input type="tel" class="phone-input" name="phone" required 
                                pattern="^1[3-9]\\d{9}$" placeholder="请输入手机号">
                        </div>
                        <div class="captcha-group">
                            <input type="text" class="captcha-input" name="captcha" 
                                placeholder="请输入验证码" maxlength="6" required>
                            <button type="button" class="send-code-btn">发送验证码</button>
                        </div>
                        <button type="submit" class="primary-btn">登录</button>
                        <div class="agreement-check">
                            <input type="checkbox" id="agreement" required>
                            <label for="agreement">
                                我已阅读并同意 <a href="#">《服务协议》</a> 和 <a href="#">《隐私政策》</a>
                            </label>
                        </div>
                    </form>
                </div>
            `;
        }

        initAliCaptcha() {
            try {
                if (typeof AWSC === 'undefined' || !AWSC.nc) {
                    console.warn('阿里云验证码 SDK 未加载，跳过验证码初始化');
                    return;
                }

                const nc = new AWSC.nc({
                    renderTo: '#your-dom-id',
                    appkey: 'FFFF0N0000000000XXXX',
                    scene: 'nc_login',
                    callback: (data) => {
                        this.handleCaptchaSuccess(data);
                    }
                });
                nc.init();
            } catch (error) {
                console.error('初始化验证码失败:', error);
            }
        }

        setupEventListeners() {
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'phoneForm') {
                    e.preventDefault();
                    this.handlePhoneSubmit(e.target);
                } else if (e.target.id === 'verifyForm') {
                    e.preventDefault();
                    this.handleVerifySubmit(e.target);
                } else if (e.target.id === 'registerForm') {
                    e.preventDefault();
                    this.handleRegisterSubmit(e.target);
                }
            });

            document.addEventListener('change', (e) => {
                if (e.target.name === 'industry') {
                    const otherGroup = document.getElementById('otherIndustryGroup');
                    if (otherGroup) {
                        otherGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
                    }
                }
            });

            // 添加发送验证码按钮的事件监听
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('send-code-btn')) {
                    e.preventDefault();
                    this.handleSendCode();
                }
            });
        }

        async handlePhoneSubmit(form) {
            try {
                const formData = new FormData(form);
                const code = formData.get('captcha');
                
                if (!code) {
                    alert('请输入验证码');
                    return;
                }
                
                const response = await fetch(`${API_BASE_URL}/api/verify_code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: this.phone,
                        code: code
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || '验证失败');
                }
                
                // 验证成功，处理登录
                this.handleLoginSuccess({
                    phone: this.phone,
                    token: data.token
                });
                
                // 关闭登录窗口
                this.closeModal();
                
            } catch (error) {
                console.error('验证失败:', error);
                alert(error.message || '验证失败，请重试');
            }
        }

        handleVerifySubmit(form) {
            const code = form.code.value;
            
            // 调用后端验证API
            fetch(`${API_BASE_URL}/api/sms/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `phone=${encodeURIComponent(this.phone)}&code=${encodeURIComponent(code)}`
            })
            .then(response => {
                if (response.ok) {
                    // 验证成功
                    this.currentStep = 'register';
                    this.updateModalContent();
                } else {
                    alert('验证码错误，请重新输入');
                }
            })
            .catch(error => {
                console.error('验证失败:', error);
                alert('验证失败，请重试');
            });
        }

        handleRegisterSubmit(form) {
            const formData = new FormData(form);
            const userData = {
                phone: this.phone,
                nickname: formData.get('nickname'),
                industry: formData.get('industry'),
                otherIndustry: formData.get('otherIndustry'),
                password: formData.get('password')
            };

            // TODO: 发送注册请求
            console.log('注册信息:', userData);
            
            // 模拟注册成功
            this.handleLoginSuccess(userData);
            alert('注册成功！');
        }

        updateModalContent() {
            const modal = document.querySelector('.auth-modal');
            if (modal) {
                modal.innerHTML = this.getModalContent();
            }
        }

        startCodeCountdown() {
            let countdown = 60;
            const btn = document.querySelector('.send-code-btn');
            if (!btn) return;

            const updateButtonText = () => {
                if (countdown > 0) {
                    btn.textContent = `${countdown}秒后重新发送`;
                    btn.disabled = true;
                    countdown--;
                    setTimeout(updateButtonText, 1000);
                } else {
                    btn.textContent = '发送验证码';
                    btn.disabled = false;
                    this.isSendingCode = false;
                }
            };

            updateButtonText();
        }

        closeModal() {
            // 移除模糊效果
            document.body.classList.remove('modal-open');
            
            document.querySelector('.modal-overlay')?.remove();
            document.querySelector('.auth-modal')?.remove();
        }

        handleCaptchaSuccess(data) {
            console.log('验证码验证成功:', data);
            // TODO: 调用发送短信验证码的接口
        }

        // 处理发送验证码
        async handleSendCode() {
            try {
                // 获取手机号输入框的值
                const phoneInput = document.querySelector('.phone-input');
                if (!phoneInput) {
                    throw new Error('找不到手机号输入框');
                }
                
                this.phone = phoneInput.value;
                
                // 验证手机号格式
                if (!this.phone || !/^1[3-9]\d{9}$/.test(this.phone)) {
                    alert('请输入正确的手机号');
                    return;
                }

                console.log('Sending request to:', `${API_BASE_URL}/api/send_code`);
                const response = await fetch(`${API_BASE_URL}/api/send_code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: this.phone
                    }),
                    mode: 'cors'
                });
                
                console.log('Response:', response);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Data:', data);
                
                // 发送成功后开始倒计时
                this.startCodeCountdown();
                
                return data;
            } catch (error) {
                console.error('Send code error:', error);
                alert(error.message || '发送验证码失败，请重试');
                throw error;
            }
        }

        // 添加登录状态检查方法
        checkLogin() {
            // TODO: 这里可以添加更复杂的登录状态检查逻辑
            // 比如检查 localStorage 中的 token 等
            return this.isLoggedIn;
        }

        // 修改登录成功的处理
        handleLoginSuccess(userInfo) {
            this.isLoggedIn = true;
            this.userInfo = userInfo;
            
            // 保存到 localStorage
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            localStorage.setItem('isLoggedIn', 'true');
            
            // 更新导航栏显示
            const userNav = document.querySelector('.user-nav');
            if (userNav) {
                // 根据当前页面路径判断用户中心的相对路径
                const isInPagesDir = window.location.pathname.includes('/pages/');
                const userPagePath = isInPagesDir ? 'user.html' : 'pages/user.html';
                
                userNav.innerHTML = `
                    <div class="user-info">
                        <a href="${userPagePath}" class="user-nickname">${userInfo.phone}</a>
                        <a href="javascript:void(0)" class="logout-btn">退出</a>
                    </div>
                `;
                
                // 绑定退出按钮事件
                const logoutBtn = userNav.querySelector('.logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => this.handleLogout());
                }
            }
        }

        handleLogout() {
            // 清除登录状态
            this.isLoggedIn = false;
            this.userInfo = null;
            localStorage.removeItem('userInfo');
            localStorage.removeItem('isLoggedIn');
            
            // 刷新页面
            window.location.reload();
        }

        // 添加显示登录提示的方法
        showLoginTip() {
            const tipModal = document.createElement('div');
            tipModal.className = 'auth-modal login-tip-modal';
            tipModal.innerHTML = `
                <div class="modal-header">
                    <h2>温馨提示</h2>
                </div>
                <div class="modal-body">
                    <p class="tip-message">请先登录后再使用该功能</p>
                    <button class="primary-btn login-now-btn">立即登录</button>
                </div>
            `;

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.addEventListener('click', () => {
                overlay.remove();
                tipModal.remove();
            });

            // 绑定立即登录按钮事件
            const loginNowBtn = tipModal.querySelector('.login-now-btn');
            loginNowBtn.addEventListener('click', () => {
                overlay.remove();
                tipModal.remove();
                this.showAuthModal();
            });

            document.body.appendChild(overlay);
            document.body.appendChild(tipModal);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // 确保只创建一个实例
    if (!window.authManager) {
        console.log('Creating new AuthManager instance');
        window.authManager = new AuthManager();
    }
    
    // 检查登录状态
    const userInfo = localStorage.getItem('userInfo');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn && userInfo) {
        window.authManager.handleLoginSuccess(JSON.parse(userInfo));
    }
    
    // 绑定登录按钮点击事件
    const loginBtn = document.getElementById('loginBtn');
    console.log('Login button found:', !!loginBtn);
    
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            console.log('Login button clicked');
            window.authManager.showAuthModal();
        };
    }
}); 