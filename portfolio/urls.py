from django.urls import path

from .views import (
    ProfileDetailAPIView,
    ProjectListAPIView,
    ContactCreateAPIView,
    SkillListAPIView,
    ExperienceListAPIView,
    CertificationListAPIView,
)

urlpatterns = [
    path("profile/", ProfileDetailAPIView.as_view(), name="profile-detail"),
    path("projects/", ProjectListAPIView.as_view(), name="project-list"),
    path("skills/", SkillListAPIView.as_view(), name="skill-list"),
    path("experience/", ExperienceListAPIView.as_view(), name="experience-list"),
    path("certifications/", CertificationListAPIView.as_view(), name="certification-list"),
    path("contact/", ContactCreateAPIView.as_view(), name="contact-create"),
]

