from rest_framework import serializers
from .models import Profile, Project, ContactMessage, Skill, Experience , Certification


# ==========================
# PROFILE
# ==========================
class ProfileSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = "__all__"

    def get_photo(self, obj):
        request = self.context.get("request")
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url)
        return None

    def get_resume(self, obj):
        request = self.context.get("request")
        if obj.resume:
            return request.build_absolute_uri(obj.resume.url)
        return None


# ==========================
# PROJECT
# ==========================
class ProjectSerializer(serializers.ModelSerializer):
    project_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = "__all__"

    def get_project_image(self, obj):
        if obj.project_image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.project_image.url)
        return None


# ==========================
# CONTACT
# ==========================
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"


# ==========================
# SKILL
# ==========================
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"




class CertificationSerializer(serializers.ModelSerializer):
    certificate_file = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = "__all__"

    def get_certificate_file(self, obj):
        if obj.certificate_file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.certificate_file.url)
        return None

# ==========================
# EXPERIENCE
# ==========================
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"

