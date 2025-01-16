import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    ACCESS_KEY_ID = os.getenv('ALIYUN_ACCESS_KEY_ID')
    ACCESS_KEY_SECRET = os.getenv('ALIYUN_ACCESS_KEY_SECRET')
    REGION_ID = 'cn-hangzhou'
    SMS_SIGN_NAME = '法槌槌'
    SMS_TEMPLATE_CODE = 'SMS_123456789'

    # Flask配置
    SECRET_KEY = os.urandom(24)
    VERIFICATION_CODE_EXPIRE = 300  # 验证码有效期（秒）