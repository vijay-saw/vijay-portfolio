from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from portfolio.views import ContactCreateAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('portfolio.urls')),   # <-- Now include is imported
    path('api/contact/', ContactCreateAPIView.as_view(), name='contact'),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
