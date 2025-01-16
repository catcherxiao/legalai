// 使用全局配置
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8081';

class ContractGenerator {
    constructor() {
        this.currentStep = 1;
        this.selectedType = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.contract-card').forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('Card clicked:', card.dataset.type);
                this.handleContractTypeSelect(card.dataset.type);
            });
        });
    }

    handleContractTypeSelect(type) {
        console.log('Selected contract type:', type);
        this.selectedType = type;
        this.loadContractForm(type);
    }

    loadContractForm(type) {
        // 创建表单页面
        const formHtml = this.getFormTemplate(type);
        
        // 创建新页面容器
        const formPage = document.createElement('div');
        formPage.className = 'page-container form-page';
        formPage.innerHTML = formHtml;

        // 替换当前页面
        const currentPage = document.getElementById('contractTypePage');
        currentPage.style.opacity = '0';
        
        setTimeout(() => {
            currentPage.parentNode.replaceChild(formPage, currentPage);
            formPage.style.opacity = '1';
            
            // 更新步骤指示器
            this.updateStepIndicator(2);
            
            // 设置表单事件监听
            this.setupFormEventListeners(formPage);
        }, 300);
    }

    getFormTemplate(type) {
        const templates = {
            'house-lease': `
                <div class="form-container">
                    <h2>房屋租赁合同信息</h2>
                    <form id="houseleaseContractForm">
                        <!-- 出租方（甲方）信息 -->
                        <div class="form-section">
                            <h3>出租方（甲方）信息</h3>
                            <div class="form-group">
                                <label>出租方名称</label>
                                <input type="text" name="partyAName" required>
                            </div>
                            <div class="form-group">
                                <label>证件号码</label>
                                <input type="text" name="partyACode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="partyAContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="partyAPhone" required>
                            </div>
                        </div>

                        <!-- 承租方（乙方）信息 -->
                        <div class="form-section">
                            <h3>承租方（乙方）信息</h3>
                            <div class="form-group">
                                <label>承租方名称</label>
                                <input type="text" name="partyBName" required>
                            </div>
                            <div class="form-group">
                                <label>证件号码</label>
                                <input type="text" name="partyBCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="partyBContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="partyBPhone" required>
                            </div>
                        </div>

                        <!-- 房屋信息 -->
                        <div class="form-section">
                            <h3>房屋信息</h3>
                            <div class="form-group">
                                <label>房屋地址</label>
                                <input type="text" name="propertyAddress" required>
                            </div>
                            <div class="form-group">
                                <label>建筑面积（平方米）</label>
                                <input type="number" name="area" required>
                            </div>
                            <div class="form-group">
                                <label>房屋用途</label>
                                <select name="purpose" required>
                                    <option value="residence">居住</option>
                                    <option value="business">商用</option>
                                    <option value="office">办公</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>房屋状况</label>
                                <textarea name="condition" rows="3" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>配套设施</label>
                                <textarea name="facilities" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 租赁信息 -->
                        <div class="form-section">
                            <h3>租赁信息</h3>
                            <div class="form-group">
                                <label>租赁期限</label>
                                <div class="date-range">
                                    <input type="date" name="startDate" required>
                                    <span>至</span>
                                    <input type="date" name="endDate" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>租金（元/月）</label>
                                <input type="number" name="rent" required>
                            </div>
                            <div class="form-group">
                                <label>支付方式</label>
                                <select name="paymentMethod" required>
                                    <option value="monthly">月付</option>
                                    <option value="quarterly">季付</option>
                                    <option value="yearly">年付</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>押金（元）</label>
                                <input type="number" name="deposit" required>
                            </div>
                        </div>

                        <!-- 其他约定 -->
                        <div class="form-section">
                            <h3>其他约定</h3>
                            <div class="form-group">
                                <label>水电费承担方式</label>
                                <select name="utilityPayment" required>
                                    <option value="tenant">承租方承担</option>
                                    <option value="landlord">出租方承担</option>
                                    <option value="share">双方分摊</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>物业费承担方式</label>
                                <select name="propertyFee" required>
                                    <option value="tenant">承租方承担</option>
                                    <option value="landlord">出租方承担</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>特别约定</label>
                                <textarea name="specialTerms" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `,
            'item-lease': `
                <div class="form-container">
                    <h2>物品租赁合同信息</h2>
                    <form id="itemleaseContractForm">
                        <!-- 出租方（甲方）信息 -->
                        <div class="form-section">
                            <h3>出租方（甲方）信息</h3>
                            <div class="form-group">
                                <label>出租方名称</label>
                                <input type="text" name="lessorName" required>
                            </div>
                            <div class="form-group">
                                <label>证件类型</label>
                                <select name="lessorIdType" required>
                                    <option value="id">居民身份证</option>
                                    <option value="business">营业执照</option>
                                    <option value="passport">护照</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>证件号码</label>
                                <input type="text" name="lessorId" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="lessorPhone" required>
                            </div>
                            <div class="form-group">
                                <label>联系地址</label>
                                <input type="text" name="lessorAddress" required>
                            </div>
                        </div>

                        <!-- 承租方（乙方）信息 -->
                        <div class="form-section">
                            <h3>承租方（乙方）信息</h3>
                            <div class="form-group">
                                <label>承租方名称</label>
                                <input type="text" name="lesseeName" required>
                            </div>
                            <div class="form-group">
                                <label>证件类型</label>
                                <select name="lesseeIdType" required>
                                    <option value="id">居民身份证</option>
                                    <option value="business">营业执照</option>
                                    <option value="passport">护照</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>证件号码</label>
                                <input type="text" name="lesseeId" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="lesseePhone" required>
                            </div>
                            <div class="form-group">
                                <label>联系地址</label>
                                <input type="text" name="lesseeAddress" required>
                            </div>
                        </div>

                        <!-- 物品信息 -->
                        <div class="form-section">
                            <h3>物品信息</h3>
                            <div class="form-group">
                                <label>物品名称</label>
                                <input type="text" name="itemName" required>
                            </div>
                            <div class="form-group">
                                <label>规格型号</label>
                                <input type="text" name="specification" required>
                            </div>
                            <div class="form-group">
                                <label>数量</label>
                                <input type="number" name="quantity" required>
                            </div>
                            <div class="form-group">
                                <label>单价（元）</label>
                                <input type="number" name="unitPrice" required>
                            </div>
                            <div class="form-group">
                                <label>总金额（元）</label>
                                <input type="number" name="totalAmount" required>
                            </div>
                            <div class="form-group">
                                <label>质量标准</label>
                                <textarea name="qualityStandard" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 租赁信息 -->
                        <div class="form-section">
                            <h3>租赁信息</h3>
                            <div class="form-group">
                                <label>租赁期限</label>
                                <div class="date-range">
                                    <input type="date" name="startDate" required>
                                    <span>至</span>
                                    <input type="date" name="endDate" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>租金（元/月）</label>
                                <input type="number" name="rent" required>
                            </div>
                            <div class="form-group">
                                <label>支付方式</label>
                                <select name="paymentMethod" required>
                                    <option value="monthly">月付</option>
                                    <option value="quarterly">季付</option>
                                    <option value="yearly">年付</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>押金（元）</label>
                                <input type="number" name="deposit" required>
                            </div>
                        </div>

                        <!-- 其他约定 -->
                        <div class="form-section">
                            <h3>其他约定</h3>
                            <div class="form-group">
                                <label>水电费承担方式</label>
                                <select name="utilityPayment" required>
                                    <option value="tenant">承租方承担</option>
                                    <option value="landlord">出租方承担</option>
                                    <option value="share">双方分摊</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>物业费承担方式</label>
                                <select name="propertyFee" required>
                                    <option value="tenant">承租方承担</option>
                                    <option value="landlord">出租方承担</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>特别约定</label>
                                <textarea name="specialTerms" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `,
            'labor': `
                <div class="form-container">
                    <h2>劳动合同信息</h2>
                    <form id="laborContractForm">
                        <!-- 用人单位（甲方）信息 -->
                        <div class="form-section">
                            <h3>用人单位（甲方）信息</h3>
                            <div class="form-group">
                                <label>单位名称</label>
                                <input type="text" name="employerName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="employerCode" required>
                            </div>
                            <div class="form-group">
                                <label>法定代表人</label>
                                <input type="text" name="employerLegalRep" required>
                            </div>
                            <div class="form-group">
                                <label>注册地址</label>
                                <input type="text" name="employerAddress" required>
                            </div>
                        </div>

                        <!-- 劳动者（乙方）信息 -->
                        <div class="form-section">
                            <h3>劳动者（乙方）信息</h3>
                            <div class="form-group">
                                <label>姓名</label>
                                <input type="text" name="employeeName" required>
                            </div>
                            <div class="form-group">
                                <label>身份证号</label>
                                <input type="text" name="employeeId" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="employeePhone" required>
                            </div>
                            <div class="form-group">
                                <label>居住地址</label>
                                <input type="text" name="employeeAddress" required>
                            </div>
                        </div>

                        <!-- 工作内容 -->
                        <div class="form-section">
                            <h3>工作内容</h3>
                            <div class="form-group">
                                <label>工作岗位</label>
                                <input type="text" name="position" required>
                            </div>
                            <div class="form-group">
                                <label>工作地点</label>
                                <input type="text" name="workLocation" required>
                            </div>
                            <div class="form-group">
                                <label>工作职责</label>
                                <textarea name="jobDuties" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 劳动合同期限 -->
                        <div class="form-section">
                            <h3>劳动合同期限</h3>
                            <div class="form-group">
                                <label>合同类型</label>
                                <select name="contractType" required>
                                    <option value="fixed">固定期限</option>
                                    <option value="unfixed">无固定期限</option>
                                    <option value="project">以完成一定工作为期限</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>合同期限</label>
                                <div class="date-range">
                                    <input type="date" name="startDate" required>
                                    <span>至</span>
                                    <input type="date" name="endDate" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>试用期</label>
                                <select name="probationPeriod" required>
                                    <option value="0">无试用期</option>
                                    <option value="1">1个月</option>
                                    <option value="2">2个月</option>
                                    <option value="3">3个月</option>
                                    <option value="6">6个月</option>
                                </select>
                            </div>
                        </div>

                        <!-- 工资待遇 -->
                        <div class="form-section">
                            <h3>工资待遇</h3>
                            <div class="form-group">
                                <label>基本工资（元/月）</label>
                                <input type="number" name="baseSalary" required>
                            </div>
                            <div class="form-group">
                                <label>是否有奖金</label>
                                <select name="hasBonusSystem" required>
                                    <option value="no">无</option>
                                    <option value="yes">有</option>
                                </select>
                            </div>
                            <div class="form-group bonus-details" style="display: none;">
                                <label>奖金类型</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="bonusTypes" value="monthly">月度奖金</label>
                                    <label><input type="checkbox" name="bonusTypes" value="quarterly">季度奖金</label>
                                    <label><input type="checkbox" name="bonusTypes" value="annual">年终奖金</label>
                                    <label><input type="checkbox" name="bonusTypes" value="performance">绩效奖金</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>是否有提成</label>
                                <select name="hasCommission" required>
                                    <option value="no">无</option>
                                    <option value="yes">有</option>
                                </select>
                            </div>
                            <div class="form-group commission-details" style="display: none;">
                                <label>提成方案</label>
                                <div class="form-group">
                                    <label>提成基数</label>
                                    <select name="commissionBase">
                                        <option value="sales">销售额</option>
                                        <option value="profit">利润</option>
                                        <option value="custom">其他</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>提成比例（%）</label>
                                    <input type="number" name="commissionRate" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label>提成说明</label>
                                    <textarea name="commissionTerms" rows="3" 
                                        placeholder="请详细说明提成计算方式、发放周期等"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>工资发放日</label>
                                <select name="salaryDay" required>
                                    <option value="1">每月1日</option>
                                    <option value="5">每月5日</option>
                                    <option value="10">每月10日</option>
                                    <option value="15">每月15日</option>
                                    <option value="20">每月20日</option>
                                    <option value="25">每月25日</option>
                                    <option value="30">每月月底</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `,
            'service': `
                <div class="form-container">
                    <h2>服务合同信息</h2>
                    <form id="serviceContractForm">
                        <!-- 委托方（甲方）信息 -->
                        <div class="form-section">
                            <h3>委托方（甲方）信息</h3>
                            <div class="form-group">
                                <label>委托方名称</label>
                                <input type="text" name="clientName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="clientCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="clientContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="clientPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="clientAddress" required>
                            </div>
                        </div>

                        <!-- 服务方（乙方）信息 -->
                        <div class="form-section">
                            <h3>服务方（乙方）信息</h3>
                            <div class="form-group">
                                <label>服务方名称</label>
                                <input type="text" name="providerName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="providerCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="providerContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="providerPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="providerAddress" required>
                            </div>
                        </div>

                        <!-- 服务内容 -->
                        <div class="form-section">
                            <h3>服务内容</h3>
                            <div class="form-group">
                                <label>服务类型</label>
                                <select name="serviceType" required>
                                    <option value="consulting">咨询服务</option>
                                    <option value="training">培训服务</option>
                                    <option value="maintenance">维护服务</option>
                                    <option value="development">开发服务</option>
                                    <option value="other">其他服务</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>服务范围</label>
                                <textarea name="serviceScope" rows="3" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>服务要求</label>
                                <textarea name="serviceRequirements" rows="3" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>服务标准</label>
                                <textarea name="serviceStandards" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 服务期限 -->
                        <div class="form-section">
                            <h3>服务期限</h3>
                            <div class="form-group">
                                <label>服务期限</label>
                                <div class="date-range">
                                    <input type="date" name="startDate" required>
                                    <span>至</span>
                                    <input type="date" name="endDate" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>服务时间</label>
                                <input type="text" name="serviceTime" placeholder="例如：工作日 9:00-18:00">
                            </div>
                        </div>

                        <!-- 服务费用 -->
                        <div class="form-section">
                            <h3>服务费用</h3>
                            <div class="form-group">
                                <label>服务费用（元）</label>
                                <input type="number" name="serviceFee" required>
                            </div>
                            <div class="form-group">
                                <label>支付方式</label>
                                <select name="paymentMethod" required>
                                    <option value="advance">预付全款</option>
                                    <option value="partial">分期付款</option>
                                    <option value="monthly">月结</option>
                                    <option value="quarterly">季度结算</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>付款说明</label>
                                <textarea name="paymentTerms" rows="3" required 
                                    placeholder="请说明具体的付款时间、比例等"></textarea>
                            </div>
                        </div>

                        <!-- 违约责任 -->
                        <div class="form-section">
                            <h3>违约责任</h3>
                            <div class="form-group">
                                <label>其他违约条款</label>
                                <textarea name="otherPenalties" rows="3" 
                                    placeholder="请补充其他违约情况及处理方式"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `,
            'sale': `
                <div class="form-container">
                    <h2>买卖合同信息</h2>
                    <form id="saleContractForm">
                        <!-- 卖方（甲方）信息 -->
                        <div class="form-section">
                            <h3>卖方（甲方）信息</h3>
                            <div class="form-group">
                                <label>卖方名称</label>
                                <input type="text" name="sellerName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="sellerCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="sellerContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="sellerPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="sellerAddress" required>
                            </div>
                        </div>

                        <!-- 买方（乙方）信息 -->
                        <div class="form-section">
                            <h3>买方（乙方）信息</h3>
                            <div class="form-group">
                                <label>买方名称</label>
                                <input type="text" name="buyerName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="buyerCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="buyerContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="buyerPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="buyerAddress" required>
                            </div>
                        </div>

                        <!-- 标的物信息 -->
                        <div class="form-section">
                            <h3>标的物信息</h3>
                            <div class="form-group">
                                <label>商品名称</label>
                                <input type="text" name="productName" required>
                            </div>
                            <div class="form-group">
                                <label>规格型号</label>
                                <input type="text" name="specification" required>
                            </div>
                            <div class="form-group">
                                <label>数量</label>
                                <input type="number" name="quantity" required>
                            </div>
                            <div class="form-group">
                                <label>单价（元）</label>
                                <input type="number" name="unitPrice" required>
                            </div>
                            <div class="form-group">
                                <label>总金额（元）</label>
                                <input type="number" name="totalAmount" required>
                            </div>
                            <div class="form-group">
                                <label>质量标准</label>
                                <textarea name="qualityStandard" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 交付信息 -->
                        <div class="form-section">
                            <h3>交付信息</h3>
                            <div class="form-group">
                                <label>交付方式</label>
                                <select name="deliveryMethod" required>
                                    <option value="once">一次性交付</option>
                                    <option value="batch">分批交付</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>交付时间</label>
                                <input type="date" name="deliveryDate" required>
                            </div>
                            <div class="form-group">
                                <label>交付地点</label>
                                <input type="text" name="deliveryLocation" required>
                            </div>
                            <div class="form-group">
                                <label>运输方式</label>
                                <select name="transportMethod" required>
                                    <option value="seller">卖方承担运输</option>
                                    <option value="buyer">买方承担运输</option>
                                    <option value="third">第三方物流</option>
                                </select>
                            </div>
                        </div>

                        <!-- 付款方式 -->
                        <div class="form-section">
                            <h3>付款方式</h3>
                            <div class="form-group">
                                <label>支付方式</label>
                                <select name="paymentMethod" required>
                                    <option value="advance">预付全款</option>
                                    <option value="partial">分期付款</option>
                                    <option value="delivery">货到付款</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>付款说明</label>
                                <textarea name="paymentTerms" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 违约责任 -->
                        <div class="form-section">
                            <h3>违约责任</h3>
                            <div class="form-group">
                                <label>质量违约金比例（%）</label>
                                <input type="number" name="qualityPenaltyRate" required>
                            </div>
                            <div class="form-group">
                                <label>延期违约金（元/天）</label>
                                <input type="number" name="delayPenalty" required>
                            </div>
                            <div class="form-group">
                                <label>其他违约条款</label>
                                <textarea name="otherPenalties" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `,
            'production': `
                <div class="form-container">
                    <h2>生产合同信息</h2>
                    <form id="productionContractForm">
                        <!-- 生产方（甲方）信息 -->
                        <div class="form-section">
                            <h3>生产方（甲方）信息</h3>
                            <div class="form-group">
                                <label>生产方名称</label>
                                <input type="text" name="producerName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="producerCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="producerContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="producerPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="producerAddress" required>
                            </div>
                        </div>

                        <!-- 委托方（乙方）信息 -->
                        <div class="form-section">
                            <h3>委托方（乙方）信息</h3>
                            <div class="form-group">
                                <label>委托方名称</label>
                                <input type="text" name="clientName" required>
                            </div>
                            <div class="form-group">
                                <label>统一社会信用代码</label>
                                <input type="text" name="clientCode" required>
                            </div>
                            <div class="form-group">
                                <label>联系人</label>
                                <input type="text" name="clientContact" required>
                            </div>
                            <div class="form-group">
                                <label>联系电话</label>
                                <input type="tel" name="clientPhone" required>
                            </div>
                            <div class="form-group">
                                <label>地址</label>
                                <input type="text" name="clientAddress" required>
                            </div>
                        </div>

                        <!-- 生产内容 -->
                        <div class="form-section">
                            <h3>生产内容</h3>
                            <div class="form-group">
                                <label>产品名称</label>
                                <input type="text" name="productName" required>
                            </div>
                            <div class="form-group">
                                <label>生产数量</label>
                                <input type="number" name="productionQuantity" required>
                            </div>
                            <div class="form-group">
                                <label>单价（元）</label>
                                <input type="number" name="unitPrice" required>
                            </div>
                            <div class="form-group">
                                <label>总金额（元）</label>
                                <input type="number" name="totalAmount" required>
                            </div>
                            <div class="form-group">
                                <label>技术要求</label>
                                <textarea name="technicalRequirements" rows="3" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>质量标准</label>
                                <textarea name="qualityStandards" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 交付方式 -->
                        <div class="form-section">
                            <h3>交付方式</h3>
                            <div class="form-group">
                                <label>交付方式</label>
                                <select name="deliveryMethod" required>
                                    <option value="once">一次性交付</option>
                                    <option value="batch">分批交付</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>交付时间</label>
                                <input type="date" name="deliveryDate" required>
                            </div>
                            <div class="form-group">
                                <label>交付地点</label>
                                <input type="text" name="deliveryLocation" required>
                            </div>
                        </div>

                        <!-- 付款方式 -->
                        <div class="form-section">
                            <h3>付款方式</h3>
                            <div class="form-group">
                                <label>支付方式</label>
                                <select name="paymentMethod" required>
                                    <option value="advance">预付全款</option>
                                    <option value="partial">分期付款</option>
                                    <option value="monthly">月结</option>
                                    <option value="quarterly">季度结算</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>付款说明</label>
                                <textarea name="paymentTerms" rows="3" required></textarea>
                            </div>
                        </div>

                        <!-- 违约责任 -->
                        <div class="form-section">
                            <h3>违约责任</h3>
                            <div class="form-group">
                                <label>质量违约金比例（%）</label>
                                <input type="number" name="qualityPenaltyRate" required>
                            </div>
                            <div class="form-group">
                                <label>延期违约金（元/天）</label>
                                <input type="number" name="delayPenalty" required>
                            </div>
                            <div class="form-group">
                                <label>其他违约条款</label>
                                <textarea name="otherPenalties" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" onclick="contractGenerator.goBack()">返回</button>
                            <button type="submit" class="primary-btn">生成合同</button>
                        </div>
                    </form>
                </div>
            `
        };
        return templates[type] || '<div class="error-message">暂不支持该类型合同</div>';
    }

    setupFormEventListeners(formPage) {
        const form = formPage.querySelector('form');
        if (form) {
            // 奖金系统显示控制
            const bonusSelect = form.querySelector('select[name="hasBonusSystem"]');
            const bonusDetails = form.querySelector('.bonus-details');
            if (bonusSelect && bonusDetails) {
                bonusSelect.addEventListener('change', (e) => {
                    bonusDetails.style.display = e.target.value === 'yes' ? 'block' : 'none';
                });
            }

            // 提成系统显示控制
            const commissionSelect = form.querySelector('select[name="hasCommission"]');
            const commissionDetails = form.querySelector('.commission-details');
            if (commissionSelect && commissionDetails) {
                commissionSelect.addEventListener('change', (e) => {
                    commissionDetails.style.display = e.target.value === 'yes' ? 'block' : 'none';
                });
            }

            // 表单提交处理
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        }
    }

    handleFormSubmit(form) {
        console.log('Form submitted, contract type:', this.selectedType);
        const formData = new FormData(form);
        const contractData = Object.fromEntries(formData.entries());
        console.log('Form data:', contractData);
        this.generateContract(contractData);
    }

    generateContract(data) {
        console.log('Generating contract for type:', this.selectedType);
        const previewHtml = this.getPreviewTemplate(data);
        console.log('Preview template:', previewHtml.substring(0, 100) + '...');
        
        // 生成合同预览页面
        const previewPage = document.createElement('div');
        previewPage.className = 'page-container preview-page';
        previewPage.innerHTML = previewHtml;

        // 替换当前页面
        const currentPage = document.querySelector('.form-page');
        if (currentPage) {
            currentPage.style.opacity = '0';
            
            setTimeout(() => {
                currentPage.parentNode.replaceChild(previewPage, currentPage);
                previewPage.style.opacity = '1';
                
                // 更新步骤指示器
                this.updateStepIndicator(3);
                
                // 设置预览页面事件监听
                this.setupPreviewEventListeners(previewPage);
            }, 300);
        } else {
            console.error('Current page not found'); // 错误日志
        }
    }

    updateStepIndicator(step) {
        document.querySelectorAll('.step').forEach((el, index) => {
            if (index + 1 === step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    goBack() {
        window.location.reload();
    }

    getPreviewTemplate(data) {
        const templates = {
            'house-lease': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>房屋租赁合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">房屋租赁合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>出租方（甲方）：${data.partyAName}</p>
                            <p>统一社会信用代码：${data.partyACode}</p>
                            <p>联系人：${data.partyAContact}</p>
                            <p>联系电话：${data.partyAPhone}</p>
                            <p>承租方（乙方）：${data.partyBName}</p>
                            <p>统一社会信用代码：${data.partyBCode}</p>
                            <p>联系人：${data.partyBContact}</p>
                            <p>联系电话：${data.partyBPhone}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、房屋信息</h3>
                            <p>房屋地址：${data.propertyAddress}</p>
                            <p>建筑面积：${data.area}平方米</p>
                            <p>房屋用途：${data.purpose}</p>
                            <p>房屋状况：${data.condition}</p>
                            <p>配套设施：${data.facilities}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、租赁信息</h3>
                            <p>租赁期限：自 ${data.startDate} 至 ${data.endDate}</p>
                            <p>租金：${data.rent}元/月</p>
                            <p>支付方式：${this.getPaymentMethodName(data.paymentMethod)}</p>
                            <p>押金：${data.deposit}元</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、其他约定</h3>
                            <p>水电费承担方式：${this.getUtilityPaymentName(data.utilityPayment)}</p>
                            <p>物业费承担方式：${this.getPropertyFeeName(data.propertyFee)}</p>
                            <p>特别约定：${data.specialTerms}</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、违约责任</h3>
                            <p>1. 租金违约：如承租方逾期支付租金，每逾期一天应支付${data.delayPenalty}元违约金。</p>
                            <p>2. 押金违约：如承租方未按约定支付押金，出租方有权解除合同并要求承租方支付违约金。</p>
                            ${data.otherPenalties ? `<p>3. 其他违约条款：${data.otherPenalties}</p>` : ''}
                        </div>

                        <div class="contract-section">
                            <h3>六、争议解决</h3>
                            <p>本合同在履行过程中发生的争议，由双方当事人协商解决，协商不成的，任何一方均可向合同签订地人民法院提起诉讼。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>出租方（甲方）：${data.partyAName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>承租方（乙方）：${data.partyBName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'item-lease': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>物品租赁合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">物品租赁合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>出租方（甲方）：${data.partyAName}</p>
                            <p>统一社会信用代码：${data.partyACode}</p>
                            <p>联系人：${data.partyAContact}</p>
                            <p>联系电话：${data.partyAPhone}</p>
                            <p>承租方（乙方）：${data.partyBName}</p>
                            <p>统一社会信用代码：${data.partyBCode}</p>
                            <p>联系人：${data.partyBContact}</p>
                            <p>联系电话：${data.partyBPhone}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、物品信息</h3>
                            <p>物品名称：${data.itemName}</p>
                            <p>规格型号：${data.specification}</p>
                            <p>数量：${data.quantity}</p>
                            <p>单价：${data.unitPrice}元</p>
                            <p>总金额：${data.totalAmount}元</p>
                            <p>质量标准：${data.qualityStandard}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、租赁信息</h3>
                            <p>租赁期限：自 ${data.startDate} 至 ${data.endDate}</p>
                            <p>租金：${data.rent}元/月</p>
                            <p>支付方式：${this.getPaymentMethodName(data.paymentMethod)}</p>
                            <p>押金：${data.deposit}元</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、其他约定</h3>
                            <p>水电费承担方式：${this.getUtilityPaymentName(data.utilityPayment)}</p>
                            <p>物业费承担方式：${this.getPropertyFeeName(data.propertyFee)}</p>
                            <p>特别约定：${data.specialTerms}</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、违约责任</h3>
                            <p>1. 租金违约：如承租方逾期支付租金，每逾期一天应支付${data.delayPenalty}元违约金。</p>
                            <p>2. 押金违约：如承租方未按约定支付押金，出租方有权解除合同并要求承租方支付违约金。</p>
                            ${data.otherPenalties ? `<p>3. 其他违约条款：${data.otherPenalties}</p>` : ''}
                        </div>

                        <div class="contract-section">
                            <h3>六、争议解决</h3>
                            <p>本合同在履行过程中发生的争议，由双方当事人协商解决，协商不成的，任何一方均可向合同签订地人民法院提起诉讼。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>出租方（甲方）：${data.partyAName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>承租方（乙方）：${data.partyBName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'labor': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>劳动合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">劳动合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>用人单位（甲方）：${data.employerName}</p>
                            <p>统一社会信用代码：${data.employerCode}</p>
                            <p>法定代表人：${data.employerLegalRep}</p>
                            <p>注册地址：${data.employerAddress}</p>
                            <p>劳动者（乙方）：${data.employeeName}</p>
                            <p>身份证号码：${data.employeeId}</p>
                            <p>联系电话：${data.employeePhone}</p>
                            <p>居住地址：${data.employeeAddress}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、合同期限</h3>
                            <p>合同类型：${this.getContractTypeName(data.contractType)}</p>
                            <p>合同期限：自 ${data.startDate} 至 ${data.endDate}</p>
                            <p>试用期：${data.probationPeriod === '0' ? '无' : data.probationPeriod + '个月'}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、工作内容</h3>
                            <p>工作岗位：${data.position}</p>
                            <p>工作地点：${data.workLocation}</p>
                            <p>工作职责：${data.jobDuties}</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、工资待遇</h3>
                            <p>基本工资：${data.baseSalary}元/月</p>
                            ${data.hasBonusSystem === 'yes' ? `
                                <p>奖金类型：${this.getBonusTypes(data.bonusTypes)}</p>
                            ` : ''}
                            ${data.hasCommission === 'yes' ? `
                                <p>提成方案：</p>
                                <p>- 提成基数：${this.getCommissionBaseName(data.commissionBase)}</p>
                                <p>- 提成比例：${data.commissionRate}%</p>
                                <p>- 提成说明：${data.commissionTerms}</p>
                            ` : ''}
                            <p>工资发放日：每月${data.salaryDay}日</p>
                            <p>工资支付方式：银行转账</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、社会保险和福利待遇</h3>
                            <p>甲方依法为乙方缴纳社会保险，包括养老保险、医疗保险、失业保险、工伤保险和生育保险。</p>
                        </div>

                        <div class="contract-section">
                            <h3>六、劳动保护和劳动条件</h3>
                            <p>1. 甲方依法为乙方提供符合国家规定的劳动保护、劳动条件和职业防护。</p>
                            <p>2. 乙方应遵守甲方的规章制度，服从工作安排。</p>
                        </div>

                        <div class="contract-section">
                            <h3>七、合同变更、解除和终止</h3>
                            <p>本合同的变更、解除和终止，按照《中华人民共和国劳动合同法》相关规定执行。</p>
                        </div>

                        <div class="contract-section">
                            <h3>八、争议处理</h3>
                            <p>因履行本合同发生争议，由双方协商解决；协商不成的，可以向劳动争议仲裁委员会申请仲裁。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>用人单位（甲方）：${data.employerName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>劳动者（乙方）：${data.employeeName}</p>
                                    <p>签字：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'service': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>服务合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">服务合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>委托方（甲方）：${data.clientName}</p>
                            <p>统一社会信用代码：${data.clientCode}</p>
                            <p>联系人：${data.clientContact}</p>
                            <p>联系电话：${data.clientPhone}</p>
                            <p>地址：${data.clientAddress}</p>
                            <p>服务方（乙方）：${data.providerName}</p>
                            <p>统一社会信用代码：${data.providerCode}</p>
                            <p>联系人：${data.providerContact}</p>
                            <p>联系电话：${data.providerPhone}</p>
                            <p>地址：${data.providerAddress}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、服务内容</h3>
                            <p>服务类型：${data.serviceType}</p>
                            <p>服务范围：${data.serviceScope}</p>
                            <p>服务要求：${data.serviceRequirements}</p>
                            <p>服务标准：${data.serviceStandards}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、服务期限</h3>
                            <p>服务期限：自 ${data.startDate} 至 ${data.endDate}</p>
                            <p>服务时间：${data.serviceTime || '工作日 9:00-18:00'}</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、服务费用及支付方式</h3>
                            <p>服务费用：${data.serviceFee}元</p>
                            <p>支付方式：${this.getPaymentMethodName(data.paymentMethod)}</p>
                            <p>付款说明：${data.paymentTerms}</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、双方权利义务</h3>
                            <p>1. 甲方权利义务：</p>
                            <p>- 按约定支付服务费用</p>
                            <p>- 提供必要的工作条件和资料</p>
                            <p>- 及时反馈相关意见</p>
                            <p>2. 乙方权利义务：</p>
                            <p>- 按约定提供优质服务</p>
                            <p>- 保守甲方商业秘密</p>
                            <p>- 定期提供服务报告</p>
                        </div>

                        <div class="contract-section">
                            <h3>六、违约责任</h3>
                            <p>1. 服务质量违约：如服务质量未达到约定标准，乙方应进行整改，并承担相应的违约责任。</p>
                            <p>2. 付款违约：甲方逾期付款，应按日支付应付金额的0.05%作为违约金。</p>
                            ${data.otherPenalties ? `<p>3. 其他违约条款：${data.otherPenalties}</p>` : ''}
                        </div>

                        <div class="contract-section">
                            <h3>七、合同变更与终止</h3>
                            <p>1. 经双方协商一致，可以变更或终止本合同。</p>
                            <p>2. 因不可抗力导致合同无法履行的，可以终止合同。</p>
                        </div>

                        <div class="contract-section">
                            <h3>八、争议解决</h3>
                            <p>本合同在履行过程中发生的争议，由双方当事人协商解决，协商不成的，任何一方均可向合同签订地人民法院提起诉讼。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>委托方（甲方）：${data.clientName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>服务方（乙方）：${data.providerName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'sale': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>买卖合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">买卖合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>卖方（甲方）：${data.sellerName}</p>
                            <p>统一社会信用代码：${data.sellerCode}</p>
                            <p>联系人：${data.sellerContact}</p>
                            <p>联系电话：${data.sellerPhone}</p>
                            <p>地址：${data.sellerAddress}</p>
                            <p>买方（乙方）：${data.buyerName}</p>
                            <p>统一社会信用代码：${data.buyerCode}</p>
                            <p>联系人：${data.buyerContact}</p>
                            <p>联系电话：${data.buyerPhone}</p>
                            <p>地址：${data.buyerAddress}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、标的物信息</h3>
                            <p>商品名称：${data.productName}</p>
                            <p>规格型号：${data.specification}</p>
                            <p>数量：${data.quantity}</p>
                            <p>单价：${data.unitPrice}元</p>
                            <p>总金额：${data.totalAmount}元</p>
                            <p>质量标准：${data.qualityStandard}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、交付信息</h3>
                            <p>交付方式：${this.getDeliveryMethodName(data.deliveryMethod)}</p>
                            <p>交付时间：${data.deliveryDate}</p>
                            <p>交付地点：${data.deliveryLocation}</p>
                            <p>运输方式：${this.getTransportMethodName(data.transportMethod)}</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、付款方式</h3>
                            <p>支付方式：${this.getPaymentMethodName(data.paymentMethod)}</p>
                            <p>付款说明：${data.paymentTerms}</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、违约责任</h3>
                            <p>1. 质量违约：如产品质量未达到约定标准，买方应按合同总额的${data.qualityPenaltyRate}%支付违约金。</p>
                            <p>2. 延期违约：如买方逾期支付货款，每逾期一天应支付${data.delayPenalty}元违约金。</p>
                            ${data.otherPenalties ? `<p>3. 其他违约条款：${data.otherPenalties}</p>` : ''}
                        </div>

                        <div class="contract-section">
                            <h3>六、争议解决</h3>
                            <p>本合同在履行过程中发生的争议，由双方当事人协商解决，协商不成的，任何一方均可向合同签订地人民法院提起诉讼。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>卖方（甲方）：${data.sellerName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>买方（乙方）：${data.buyerName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'production': `
                <div class="preview-container">
                    <div class="preview-header">
                        <h2>生产合同</h2>
                        <div class="preview-actions">
                            <button class="secondary-btn" onclick="contractGenerator.editContract()">编辑</button>
                            <button class="primary-btn" onclick="contractGenerator.downloadContract()">下载合同</button>
                        </div>
                    </div>
                    <div class="preview-content" contenteditable="true">
                        <div class="contract-title">生产合同</div>
                        
                        <div class="contract-section">
                            <h3>一、合同双方</h3>
                            <p>生产方（甲方）：${data.producerName}</p>
                            <p>统一社会信用代码：${data.producerCode}</p>
                            <p>联系人：${data.producerContact}</p>
                            <p>联系电话：${data.producerPhone}</p>
                            <p>地址：${data.producerAddress}</p>
                            <p>委托方（乙方）：${data.clientName}</p>
                            <p>统一社会信用代码：${data.clientCode}</p>
                            <p>联系人：${data.clientContact}</p>
                            <p>联系电话：${data.clientPhone}</p>
                            <p>地址：${data.clientAddress}</p>
                        </div>

                        <div class="contract-section">
                            <h3>二、生产内容</h3>
                            <p>产品名称：${data.productName}</p>
                            <p>生产数量：${data.productionQuantity}</p>
                            <p>单价：${data.unitPrice}元</p>
                            <p>总金额：${data.totalAmount}元</p>
                            <p>技术要求：${data.technicalRequirements}</p>
                            <p>质量标准：${data.qualityStandards}</p>
                        </div>

                        <div class="contract-section">
                            <h3>三、交付方式</h3>
                            <p>交付方式：${this.getDeliveryMethodName(data.deliveryMethod)}</p>
                            <p>交付时间：${data.deliveryDate}</p>
                            <p>交付地点：${data.deliveryLocation}</p>
                        </div>

                        <div class="contract-section">
                            <h3>四、付款方式</h3>
                            <p>支付方式：${this.getPaymentMethodName(data.paymentMethod)}</p>
                            <p>付款说明：${data.paymentTerms}</p>
                        </div>

                        <div class="contract-section">
                            <h3>五、违约责任</h3>
                            <p>1. 质量违约：如产品质量未达到约定标准，委托方应按合同总额的${data.qualityPenaltyRate}%支付违约金。</p>
                            <p>2. 延期违约：如委托方逾期交付，每逾期一天应支付${data.delayPenalty}元违约金。</p>
                            ${data.otherPenalties ? `<p>3. 其他违约条款：${data.otherPenalties}</p>` : ''}
                        </div>

                        <div class="contract-section">
                            <h3>六、争议解决</h3>
                            <p>本合同在履行过程中发生的争议，由双方当事人协商解决，协商不成的，任何一方均可向合同签订地人民法院提起诉讼。</p>
                        </div>

                        <div class="contract-signatures">
                            <div class="signature-row">
                                <div class="signature-block">
                                    <p>生产方（甲方）：${data.producerName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                                <div class="signature-block">
                                    <p>委托方（乙方）：${data.clientName}</p>
                                    <p>法定代表人或授权代表：____________</p>
                                    <p>日期：____________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        return templates[this.selectedType] || '<div class="error-message">暂不支持该类型合同的预览</div>';
    }

    // 辅助方法：获取交付方式名称
    getDeliveryMethodName(method) {
        const methods = {
            'once': '一次性交付',
            'batch': '分批交付',
            'continuous': '持续供货'
        };
        return methods[method] || method;
    }

    // 辅助方法：获取支付方式名称
    getPaymentMethodName(method) {
        const methods = {
            'advance': '预付全款',
            'partial': '分期付款',
            'delivery': '交付付款'
        };
        return methods[method] || method;
    }

    editContract() {
        // 返回表单页面
        this.loadContractForm(this.selectedType);
    }

    downloadContract() {
        const content = document.querySelector('.preview-content').innerHTML;
        const style = `
            <style>
                body {
                    font-family: "SimSun", serif;
                    line-height: 1.8;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    color: #333;
                }

                .contract-title {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 40px;
                    padding: 20px 0;
                }

                .contract-section {
                    margin-bottom: 30px;
                }

                .contract-section h3 {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }

                .contract-section p {
                    margin: 10px 0;
                    text-indent: 2em;
                    line-height: 2;
                }

                .contract-signatures {
                    margin-top: 60px;
                }

                .signature-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    page-break-inside: avoid;
                }

                .signature-row p {
                    margin: 0;
                    line-height: 2;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .contract-section {
                        page-break-inside: avoid;
                    }

                    .contract-signatures {
                        page-break-before: auto;
                    }
                }

                /* 打印时的页面设置 */
                @page {
                    size: A4;
                    margin: 2cm;
                }
            </style>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${this.getContractTitle()}</title>
                ${style}
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.getContractTitle()}_${new Date().toLocaleDateString()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 获取合同标题
    getContractTitle() {
        const titleMap = {
            'house-lease': '房屋租赁合同',
            'item-lease': '物品租赁合同',
            'labor': '劳动合同',
            'service': '服务合同',
            'sale': '买卖合同',
            'production': '生产合同'
        };
        return titleMap[this.selectedType] || '合同';
    }

    // 辅助方法：获取合同类型名称
    getContractTypeName(type) {
        const types = {
            'fixed': '固定期限',
            'unfixed': '无固定期限',
            'project': '以完成一定工作为期限'
        };
        return types[type] || type;
    }

    // 辅助方法：获取奖金类型名称
    getBonusTypes(types) {
        if (!types) return '无';
        const typeNames = {
            'monthly': '月度奖金',
            'quarterly': '季度奖金',
            'annual': '年终奖金',
            'performance': '绩效奖金'
        };
        if (Array.isArray(types)) {
            return types.map(type => typeNames[type] || type).join('、');
        }
        return typeNames[types] || types;
    }

    // 辅助方法：获取提成基数名称
    getCommissionBaseName(base) {
        const bases = {
            'sales': '销售额',
            'profit': '利润',
            'custom': '其他'
        };
        return bases[base] || base;
    }

    // 辅助方法：获取水电费承担方式名称
    getUtilityPaymentName(type) {
        const types = {
            'tenant': '承租方承担',
            'landlord': '出租方承担',
            'share': '双方分摊'
        };
        return types[type] || type;
    }

    // 辅助方法：获取物业费承担方式名称
    getPropertyFeeName(type) {
        const types = {
            'tenant': '承租方承担',
            'landlord': '出租方承担'
        };
        return types[type] || type;
    }

    // 添加缺失的辅助方法
    getTransportMethodName(method) {
        const methods = {
            'road': '公路运输',
            'railway': '铁路运输',
            'air': '航空运输',
            'sea': '海运',
            'multimodal': '多式联运'
        };
        return methods[method] || method;
    }
}

// 初始化
let contractGenerator;
document.addEventListener('DOMContentLoaded', () => {
    contractGenerator = new ContractGenerator();
}); 