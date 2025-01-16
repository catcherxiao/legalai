class UserManager {
    constructor() {
        this.initializeUser();
        this.setupEventListeners();
    }

    initializeUser() {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            window.location.href = '../index.html';
            return;
        }

        const user = JSON.parse(userInfo);
        this.updateUserInfo(user);
    }

    updateUserInfo(user) {
        // 显示手机号
        const phoneFields = document.querySelectorAll('.profile-field .field-value');
        if (phoneFields && phoneFields.length >= 2) {
            // 手机号显示
            phoneFields[0].textContent = user.phone;
            // 昵称显示（如果没有昵称则显示手机号）
            phoneFields[1].textContent = user.nickname || user.phone;
        }

        // 更新昵称输入框的值
        const nicknameInput = document.querySelector('.profile-field .field-input');
        if (nicknameInput) {
            nicknameInput.value = user.nickname || user.phone;
        }

        // 显示头像（如果有）
        if (user.avatar) {
            this.displayAvatar(user.avatar);
        }
    }

    setupEventListeners() {
        // 头像上传
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // 昵称编辑
        const nicknameField = document.querySelector('.profile-item:last-child .profile-field');
        if (nicknameField) {
            const editBtn = nicknameField.querySelector('.edit-btn');
            const valueSpan = nicknameField.querySelector('.field-value');
            const input = nicknameField.querySelector('.field-input');

            editBtn.addEventListener('click', () => {
                if (editBtn.textContent === '修改') {
                    // 切换到编辑模式
                    valueSpan.style.display = 'none';
                    input.style.display = 'block';
                    input.value = valueSpan.textContent;
                    input.focus();
                    editBtn.textContent = '保存';
                    editBtn.classList.remove('edit-btn');
                    editBtn.classList.add('save-btn');
                } else {
                    // 保存修改
                    const newNickname = input.value.trim();
                    if (newNickname) {
                        valueSpan.textContent = newNickname;
                        // 更新 localStorage
                        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                        userInfo.nickname = newNickname;
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        // TODO: 同步到后端
                    }
                    
                    // 切换回显示模式
                    valueSpan.style.display = 'block';
                    input.style.display = 'none';
                    editBtn.textContent = '修改';
                    editBtn.classList.remove('save-btn');
                    editBtn.classList.add('edit-btn');
                }
            });
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            alert('请上传 JPG 或 PNG 格式的图片');
            return;
        }

        // 验证文件大小（例如最大 2MB）
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过 2MB');
            return;
        }

        // 读取并显示图片
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayAvatar(e.target.result);
            // TODO: 上传到服务器
            // this.uploadAvatarToServer(file);
        };
        reader.readAsDataURL(file);
    }

    displayAvatar(src) {
        const placeholder = document.querySelector('.avatar-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `<img src="${src}" alt="用户头像">`;
        }
    }

    loadHistory() {
        // TODO: 从后端获取历史记录
        // 这里使用模拟数据
        const records = this.getMockHistoryRecords();
        this.totalRecords = records.length;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageRecords = records.slice(startIndex, endIndex);
        
        this.renderHistoryRecords(pageRecords);
        this.updatePagination();
    }

    renderHistoryRecords(records) {
        const listElement = document.querySelector('.history-list');
        const emptyElement = document.querySelector('.empty-history');
        
        if (!records.length) {
            listElement.innerHTML = '';
            emptyElement.style.display = 'block';
            return;
        }

        emptyElement.style.display = 'none';
        listElement.innerHTML = records.map(record => `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-type">${record.type}</span>
                    <span class="history-time">${record.time}</span>
                </div>
                <div class="history-cost">-${record.cost}积分</div>
            </div>
        `).join('');
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalRecords / this.pageSize);
        const prevBtn = document.querySelector('.page-btn.prev');
        const nextBtn = document.querySelector('.page-btn.next');
        const pageInfo = document.querySelector('.page-info');

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        pageInfo.textContent = `第 ${this.currentPage} 页 / 共 ${totalPages} 页`;
    }

    changePage(direction) {
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < Math.ceil(this.totalRecords / this.pageSize)) {
            this.currentPage++;
        }
        this.loadHistory();
    }

    getMockHistoryRecords() {
        // 模拟数据
        return [
            { type: '法律问答', time: '2024-01-04 19:30', cost: 1 },
            { type: '合同分析', time: '2024-01-04 18:20', cost: 100 },
            // ... 更多记录
        ];
    }

    // 其他方法...
}

// 初始化
let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
}); 