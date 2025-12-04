# portfolio/serializers.py
from rest_framework import serializers
from .models import (
    Profile,
    Skill,
    Project,
    Experience,
    Certification,
    WhyHireMe,
    AIProfile,
    ContactMessage,
)

# --------- CHILD SERIALIZERS ---------

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "category", "name", "level", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id",
            "role",
            "company",
            "start_date",
            "end_date",
            "is_current",
            "description",
            "order",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "tech_stack",
            "github_url",
            "demo_url",
            "project_image",
            "highlight",
            "order",
            "created_at",
        ]


class CertificationSerializer(serializers.ModelSerializer):
    profile_username = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "name",             # ✔ use this
            "issuer",
            "issue_date",
            "expiry_date",
            "credential_id",
            "credential_url",
            "profile",
            "profile_username",
        ]

    def get_profile_username(self, obj):
        if obj.profile:
            return obj.profile.username
        return None


class WhyHireMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyHireMe
        fields = ["id", "title", "description", "icon", "priority"]


class AIProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIProfile
        fields = [
            "id",
            "about_me",
            "skills",
            "experience",
            "projects",
            "certifications",
            "achievements",
        ]


class ContactMessageSerializer(serializers.ModelSerializer):
    profile_username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "message",
            "created_at",
            "profile",
            "profile_username",
            "is_read",            # 👈 NEW
        ]
        extra_kwargs = {
            "profile": {"read_only": True},
            "is_read": {"read_only": True},  # we’ll change it via a custom action
        }

    def get_profile_username(self, obj):
        if obj.profile:
            return obj.profile.username
        return None


# --------- PROFILE SERIALIZER (NESTED) ---------

class ProfileSerializer(serializers.ModelSerializer):
    # nested, read-only relations
    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    whyhiremes = WhyHireMeSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "name",
            "username",
            "role",
            "summary",
            "location",
            "email",
            "linkedin",
            "github",
            "photo",
            "resume",
            "public",
            "created_at",
            # nested data:
            "skills",
            "experiences",
            "projects",
            "certifications",
            "whyhiremes",
        ]
        extra_kwargs = {
            "user": {"read_only": True},  # don’t require user on updateProfile
        }

