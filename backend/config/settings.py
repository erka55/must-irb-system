import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# .env файлыг унших
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

# 1. INSTALLED_APPS хэсэгт санг болон шинэ аппуудаа нэмнэ
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',

    # Local Apps
    'users',
    'proposals',
    'reviews',
    'documents',
    'meetings',
    'notifications',
]

# 2. MIDDLEWARE хэсэгт CorsMiddleware-ийг эхэнд нь нэмнэ
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Хамгийн дээр байх шаардлагатай
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# 3. DATABASES - PostgreSQL баазтай холбох тохиргоо
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'postgres'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'mn-mn'  # Эсвэл 'en-us'
TIME_ZONE = 'Asia/Ulaanbaatar'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 4. Django REST Framework & JWT Authentication Тохиргоо
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'MUST IRB System API Documentation',
    'DESCRIPTION': 'ШУТИС-ийн Ёс зүйн хяналтын хорооны (IRB) системийн REST API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    # Swagger дээр JWT Токен оруулах товчлуурыг нэмэх:
    'COMPONENT_SPLIT_REQUEST': True,
    'SECURITY': [{'BearerAuth': []}],
    'SECURITY_DEFINITIONS': {
        'BearerAuth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT Токеноо "Bearer <your_access_token>" хэлбэрээр оруулна уу.',
        }
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 5. CORS Тохиргоо (Next.js / React Фронтэндтэй холбогдоход шаардлагатай)
CORS_ALLOW_ALL_ORIGINS = True  # Хөгжүүлэлтийн үед зөвшөөрнө

AUTH_USER_MODEL = 'users.User'

# Media files (Uploaded files management)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Мэдэгдэл имэйлээр илгээх тохиргоо (Туршилтын горим: Консол дээр хэвлэнэ)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'MUST IRB System <irb@must.edu.mn>'

# Бодит Gmail/SMTP ашиглах үед дараах тохиргоог нээж ашиглана:
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your_email@gmail.com'
# EMAIL_HOST_PASSWORD = 'your_app_password'
