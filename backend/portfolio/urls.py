from django.urls import path
from .views import (
    ProfileDetailAPIView,
    ProjectListAPIView,
    ContactCreateAPIView,
    ChatAPIView,
)

urlpatterns = [
    path('profile/', ProfileDetailAPIView.as_view(), name='profile-detail'),
    path('projects/', ProjectListAPIView.as_view(), name='project-list'),
    path('contact/', ContactCreateAPIView.as_view(), name='contact-create'),

    # NEW CHAT ROUTE
    path('chat/', ChatAPIView.as_view(), name='chat-api'),
]

