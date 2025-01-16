from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import os
import re
from alibabacloud_dysmsapi20170525.client import Client
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_dysmsapi20170525 import models as dysmsapi_models
import random
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# 修改 CORS 配置，允许所有来源
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# API配置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'sk-5c9ab287a9024008bba317727fb20a26')
DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

# 模拟数据存储
users = {}
verification_codes = {}

def send_sms_code(phone, code):
    """发送短信验证码"""
    try:
        # 创建配置
        config = open_api_models.Config(
            access_key_id=os.getenv('ALIYUN_ACCESS_KEY_ID'),
            access_key_secret=os.getenv('ALIYUN_ACCESS_KEY_SECRET')
        )
        config.endpoint = 'dysmsapi.aliyuncs.com'
        
        # 创建客户端
        client = Client(config)
        
        # 创建请求
        send_req = dysmsapi_models.SendSmsRequest(
            phone_numbers=phone,
            sign_name=os.getenv('ALIYUN_SMS_SIGN_NAME', '法锤锤'),  # 从环境变量获取签名
            template_code=os.getenv('ALIYUN_SMS_TEMPLATE_CODE', 'SMS_477625022'),  # 从环境变量获取模板ID
            template_param='{"code":"%s"}' % code
        )
        
        # 发送请求
        response = client.send_sms(send_req)
        
        # 记录响应
        logger.info(f"Aliyun SMS Response: {response.body}")
        
        # 检查发送结果
        if response.body.code == 'OK':
            return response
        else:
            raise Exception(f"Send SMS failed: {response.body.message}")
            
    except Exception as e:
        logger.error(f"Send SMS failed: {str(e)}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({'status': 'healthy'})

@app.route('/api/send_code', methods=['POST'])
def send_code():
    """发送短信验证码"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        
        if not phone:
            return jsonify({'error': '手机号不能为空'}), 400
            
        # 生成6位随机验证码
        code = ''.join(random.choices('0123456789', k=6))
        
        try:
            # 调用短信发送函数
            send_sms_code(phone, code)
            
            # 将验证码保存到缓存中
            verification_codes[phone] = {
                'code': code,
                'expires_at': datetime.now() + timedelta(minutes=5)
            }
            
            return jsonify({
                'message': '验证码发送成功',
                'debug_code': code  # 仅在开发环境返回验证码
            })
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return jsonify({
                'error': '短信发送失败，请稍后重试',
                'detail': str(e)
            }), 200  # 返回200而不是500，因为这是预期内的错误
            
    except Exception as e:
        logger.error(f"Error in send_code: {str(e)}")
        return jsonify({'error': '服务器错误'}), 500

@app.route('/api/verify_code', methods=['POST'])
def verify_code():
    """验证码验证端点"""
    try:
        data = request.json
        phone = data.get('phone')
        code = data.get('code')
        
        if not phone or not code:
            return jsonify({'error': '手机号和验证码不能为空'}), 400
            
        # 获取存储的验证码信息
        stored_data = verification_codes.get(phone)
        if not stored_data:
            return jsonify({'error': '验证码已过期或不存在'}), 400
            
        stored_code = stored_data['code']
        expires_at = stored_data['expires_at']
        
        # 检查验证码是否过期
        if datetime.now() > expires_at:
            # 删除过期的验证码
            verification_codes.pop(phone, None)
            return jsonify({'error': '验证码已过期'}), 400
        
        # 验证码匹配检查
        if code == stored_code:
            # 验证成功后删除验证码
            verification_codes.pop(phone, None)
            
            # 生成用户token
            token = f"test_token_{phone}"
            users[phone] = {
                'token': token,
                'phone': phone
            }
            
            logger.info(f"User {phone} verified successfully")
            return jsonify({
                'success': True,
                'token': token,
                'message': '验证成功'
            })
        else:
            return jsonify({'error': '验证码错误'}), 400
            
    except Exception as e:
        logger.error(f"Error in verify_code: {str(e)}")
        return jsonify({'error': '验证失败'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI聊天端点"""
    try:
        messages = request.json.get('messages')
        if not messages:
            return jsonify({'error': '消息不能为空'}), 400

        logger.info("Sending request to DeepSeek API")
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 2000
            },
            timeout=30  # 设置超时时间
        )
        
        if not response.ok:
            logger.error(f"DeepSeek API error: {response.text}")
            return jsonify({'error': 'AI服务请求失败'}), response.status_code
            
        return jsonify(response.json())
    except requests.Timeout:
        logger.error("DeepSeek API timeout")
        return jsonify({'error': 'AI服务响应超时'}), 504
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/contract/analyze', methods=['POST'])
def analyze_contract():
    """合同分析端点"""
    try:
        if not request.is_json:
            return jsonify({'error': '请求格式必须是 JSON'}), 400
            
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': '合同文本不能为空'}), 400
            
        if len(text) > 5000:
            return jsonify({'error': '合同文本不能超过5000字'}), 400

        # 调用 DeepSeek API 进行分析
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': '''你是一位专业的法律顾问，请分析合同文本中的潜在风险。
                        请按照以下格式返回分析结果，每个风险点包含：
                        1. 风险等级（用 high/medium/low 表示）
                        2. 风险标题（简短描述风险点）
                        3. 风险描述（详细说明风险原因）
                        4. 修改建议（具体的改进方案）
                        
                        示例格式：
                        风险等级：high
                        风险标题：违约金条款过高
                        风险描述：合同中约定的违约金比例为合同总额的5%/天，明显超过了法律允许的范围。
                        修改建议：建议将违约金比例调整为不超过千分之五/天。
                        
                        请分析完所有风险点后，用"---"分隔每个风险点。'''
                    },
                    {
                        'role': 'user',
                        'content': f'请分析以下合同文本的风险点：\n\n{text}'
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 2000
            }
        )
        
        if not response.ok:
            return jsonify({'error': 'AI服务请求失败'}), response.status_code
            
        ai_response = response.json()
        analysis_text = ai_response['choices'][0]['message']['content']
        
        # 解析 AI 返回的文本，转换为结构化数据
        risks = []
        risk_sections = analysis_text.split('---')
        
        for section in risk_sections:
            if not section.strip():
                continue
                
            lines = section.strip().split('\n')
            risk = {}
            
            for line in lines:
                if '风险等级：' in line:
                    risk['level'] = line.split('：')[1].strip()
                elif '风险标题：' in line:
                    risk['title'] = line.split('：')[1].strip()
                elif '风险描述：' in line:
                    risk['description'] = line.split('：')[1].strip()
                elif '修改建议：' in line:
                    risk['suggestion'] = line.split('：')[1].strip()
            
            if risk:
                risks.append(risk)
        
        return jsonify({'risks': risks})
        
    except Exception as e:
        logger.error(f"Error in analyze_contract: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=8081, debug=True)  # 修改端口为 8081 