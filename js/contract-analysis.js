// 使用全局配置
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8081';

class AdvancedContractAnalysis {
    constructor() {
        this.apiEndpoint = `${API_BASE_URL}/api/contract/analyze`;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const contractText = document.getElementById('contractText');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const currentCount = document.getElementById('currentCount');

        if (contractText) {
            // 字数统计
            contractText.addEventListener('input', (e) => {
                const count = e.target.value.length;
                if (currentCount) {
                    currentCount.textContent = count;
                }
            });
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                const text = contractText?.value?.trim();
                if (!text) {
                    alert('请输入合同文本');
                    return;
                }
                this.analyzeContract(text);
            });
        }
    }

    async analyzeContract(text) {
        try {
            // 显示加载状态
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = true;
                analyzeBtn.textContent = '分析中...';
            }

            // 调用后端 API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `分析请求失败: ${response.status}`);
            }

            const analysis = await response.json();
            console.log('Received analysis:', analysis);

            // 显示分析结果
            this.displayResults(analysis);

        } catch (error) {
            console.error('Analysis failed:', error);
            alert(`合同分析失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '开始分析';
            }
        }
    }

    displayResults(analysis) {
        // 更新风险等级概览
        const riskSummary = document.querySelector('.risk-summary');
        if (riskSummary) {
            // 重新计算各风险等级的数量
            const summary = {
                high: analysis.risks.filter(r => r.level === 'high').length,
                medium: analysis.risks.filter(r => r.level === 'medium').length,
                low: analysis.risks.filter(r => r.level === 'low').length
            };
            summary.total = summary.high + summary.medium + summary.low;
            
            riskSummary.textContent = `共发现 ${summary.total} 处风险点，其中高风险 ${summary.high} 处，中风险 ${summary.medium} 处，低风险 ${summary.low} 处`;
        }

        // 更新风险等级标签
        const riskLevelDiv = document.querySelector('.risk-level');
        if (riskLevelDiv) {
            // 根据实际风险数量设置显示
            if (analysis.risks.some(r => r.level === 'high')) {
                riskLevelDiv.className = 'risk-level high';
                riskLevelDiv.textContent = '高风险';
            } else if (analysis.risks.some(r => r.level === 'medium')) {
                riskLevelDiv.className = 'risk-level medium';
                riskLevelDiv.textContent = '中风险';
            } else {
                riskLevelDiv.className = 'risk-level low';
                riskLevelDiv.textContent = '低风险';
            }
        }

        // 显示具体风险点列表
        const riskList = document.querySelector('.risk-list');
        if (riskList) {
            riskList.innerHTML = '';  // 清空现有内容

            // 对风险点进行排序（高->中->低）
            const sortedRisks = analysis.risks.sort((a, b) => {
                const riskLevel = { 'high': 3, 'medium': 2, 'low': 1 };
                return riskLevel[b.level] - riskLevel[a.level];
            });

            // 显示排序后的风险点
            sortedRisks.forEach(risk => {
                const riskElement = document.createElement('div');
                riskElement.className = `risk-item risk-${risk.level}`;
                riskElement.innerHTML = `
                    <div class="risk-title">
                        <span class="risk-level ${risk.level}">${this.getRiskLevelText(risk.level)}</span>
                        ${risk.title}
                    </div>
                    <div class="risk-content">
                        <p>${risk.description}</p>
                        ${this.formatQuotes(risk.quotes)}
                    </div>
                    <div class="risk-suggestion">
                        <h4>修改建议</h4>
                        <p>${risk.suggestion}</p>
                    </div>
                `;
                riskList.appendChild(riskElement);
            });
        }

        // 显示分析结果区域
        document.getElementById('analysisResult').style.display = 'block';
    }

    formatQuotes(quotes) {
        if (!quotes || quotes.length === 0) {
            return '';
        }
        
        return quotes.map(quote => `
            <div class="risk-quote">
                <span class="risk-location">第${quote.page}页 第${quote.line}行</span>
                <span class="quote-text">${quote.text}</span>
            </div>
        `).join('');
    }

    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        const half = Math.floor((maxLength - 3) / 2);
        return text.slice(0, half) + '...' + text.slice(-half);
    }

    getRiskLevelText(level) {
        const levelMap = {
            'high': '高风险',
            'medium': '中风险',
            'low': '低风险'
        };
        return levelMap[level] || '未知风险';
    }
}

// 确保只创建一个实例
window.contractAnalysis = window.contractAnalysis || new AdvancedContractAnalysis(); 