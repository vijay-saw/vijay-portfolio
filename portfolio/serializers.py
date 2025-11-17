from rest_framework import serializers
from .models import Profile, Project, ContactMessage

class ProfileSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = "__all__"

    def get_photo(self, obj):
        if obj.photo:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.photo.url)
        return None

    def get_resume(self, obj):
        if obj.resume:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.resume.url)
        return None


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"

