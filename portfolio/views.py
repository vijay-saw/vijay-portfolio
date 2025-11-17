from rest_framework import generics, status
from rest_framework.response import Response

from .models import (
    Profile,
    Project,
    ContactMessage,
    Skill,
    Experience,
    Certification
)

from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    ContactMessageSerializer,
    SkillSerializer,
    ExperienceSerializer,
    CertificationSerializer
)


# ===============================
# PROFILE
# ===============================
class ProfileDetailAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()   # single profile


# ===============================
# PROJECTS
# ===============================
class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer


# ===============================
# SKILLS
# ===============================
class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by("category", "name")
    serializer_class = SkillSerializer


# ===============================
# EXPERIENCE
# ===============================
class ExperienceListAPIView(generics.ListAPIView):
    queryset = Experience.objects.all().order_by("-id")
    serializer_class = ExperienceSerializer


# ===============================
# CERTIFICATIONS
# ===============================
class CertificationListAPIView(generics.ListAPIView):
    queryset = Certification.objects.all().order_by("-id")
    serializer_class = CertificationSerializer


# ===============================
# CONTACT FORM — FIXED
# ===============================
class ContactCreateAPIView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"success": "Message sent successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"error": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

