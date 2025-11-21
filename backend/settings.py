"""
Django settings for backend project.
"""

from pathlib import Path
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")




BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-fg^(=c(pb1!ml)tmf3m0mss2_-q#c1-dn8d@)d@(e)%@d+^@*q'

DEBUG = True

ALLOWED_HOSTS = ["*"]   # Allow all for now (React dev server)
# In production, change to your domain / server IP.


# -----------------------------------------------------------
# APPLICATIONS
# -----------------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Your app
    'portfolio',
]

# -----------------------------------------------------------
# MIDDLEWARE
# -----------------------------------------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',   # MUST BE FIRST
    'whitenoise.middleware.WhiteNoiseMiddleware',      # MUST COME RIGHT AFTER SECURITY
    'corsheaders.middleware.CorsMiddleware',           # SHOULD COME AFTER WHITENOISE
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# -----------------------------------------------------------
# CORS SETTINGS
# -----------------------------------------------------------

#CORS_ALLOWED_ORIGINS = [
 #   "http://localhost:5173",   # React dev server
  #  "http://localhost:3000", 
#]

# If needed:
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['*']
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = [
    "http://4.192.73.68",
    "https://4.192.73.68",
]


# -----------------------------------------------------------
# REST FRAMEWORK
# -----------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}


# -----------------------------------------------------------
# URL CONFIGURATION
# -----------------------------------------------------------

ROOT_URLCONF = 'backend.urls'


# -----------------------------------------------------------
# TEMPLATES
# -----------------------------------------------------------

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


# -----------------------------------------------------------
# WSGI
# -----------------------------------------------------------

WSGI_APPLICATION = 'backend.wsgi.application'


# -----------------------------------------------------------
# DATABASE
# -----------------------------------------------------------

#DATABASES = {
 #   'default': {
  #      'ENGINE': 'django.db.backends.sqlite3',
   #     'NAME': BASE_DIR / 'db.sqlite3',
   # }
#}


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/app/db/db.sqlite3',
    }
}




# -----------------------------------------------------------
# AUTHENTICATION
# -----------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# -----------------------------------------------------------
# INTERNATIONALIZATION
# -----------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# -----------------------------------------------------------
# STATIC FILES
# -----------------------------------------------------------

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'


# -----------------------------------------------------------
# DEFAULT AUTO FIELD
# -----------------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'




