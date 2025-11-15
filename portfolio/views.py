from rest_framework import generics
from .models import Profile, Project, ContactMessage
from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    ContactMessageSerializer,
)

# GET single profile (you’ll usually have 1 record)
class ProfileDetailAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()  # return first profile


# GET /api/projects (list)
class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all().order_by('-id')
    serializer_class = ProjectSerializer


# POST /api/contact (create)
class ContactCreateAPIView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

