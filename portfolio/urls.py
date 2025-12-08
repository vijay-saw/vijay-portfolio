# portfolio/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ProfileViewSet, SkillViewSet, ProjectViewSet, ExperienceViewSet,
    CertificationViewSet, WhyHireMeViewSet, AIProfileViewSet,
    PublicProfileViewSet, ContactMessageViewSet,
    site_owner_profile,
    site_owner_skills,
    site_owner_projects,
    site_owner_certifications,   # 👈 ADD THIS
    chat_with_ai,
    site_owner_experience,
    site_owner_whyhireme,   # 👈 ADD THIS
)
from .auth_views import register

router = DefaultRouter()
router.register(r"skills", SkillViewSet, basename="skills")
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"experience", ExperienceViewSet, basename="experience")
router.register(r"certifications", CertificationViewSet, basename="certifications")

# Correct long-term stable endpoint
router.register(r"whyhireme", WhyHireMeViewSet, basename="whyhireme")

router.register(r"aiprofiles", AIProfileViewSet, basename="aiprofiles")
router.register(r"public-profiles", PublicProfileViewSet, basename="public-profiles")
router.register(r"contact-messages", ContactMessageViewSet, basename="contact-messages")

urlpatterns = [
    path("auth/register/", register, name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # single-profile endpoint
    path(
        "profile/",
        ProfileViewSet.as_view({"get": "retrieve", "put": "partial_update", "patch": "partial_update"})
    ),

    # PUBLIC → default owner's profile
    path("site-profile/", site_owner_profile, name="site-owner-profile"),
    path("site-skills/", site_owner_skills, name="site-owner-skills"),
    path("site-experience/", site_owner_experience, name="site-owner-experience"),
    path("site-projects/", site_owner_projects, name="site-owner-projects"),
    # PUBLIC → default owner's WhyHireMe
    path("site-whyhireme/", site_owner_whyhireme, name="site-owner-whyhireme"),  # 👈 ADD THIS
    path("site-certifications/", site_owner_certifications, name="site-owner-certifications"),
    path("chat/", chat_with_ai, name="chat-with-ai"),


    # user-owned (private)
    path("skills/", SkillViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),
    path("projects/", ProjectViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),
    path("experience/", ExperienceViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),
    path("certifications/", CertificationViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),
    path("whyhireme/", WhyHireMeViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),
    path("aiprofiles/", AIProfileViewSet.as_view({"get": "list", "post": "create", "put": "bulk_update"})),

    # router endpoints
    path("", include(router.urls)),
]

