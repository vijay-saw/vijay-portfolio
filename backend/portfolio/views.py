from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
import os
import openai

from .models import Profile, Project, ContactMessage
from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    ContactMessageSerializer,
)

# GET /api/profile/
class ProfileDetailAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()


# GET /api/projects/
class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer


# POST /api/contact/
class ContactCreateAPIView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

class ChatAPIView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "")

        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # SIMPLE DEMO RESPONSE — NO AI
        bot_reply = f"You said: {user_message}. (This is demo chatbot reply)"

        return Response({"reply": bot_reply})

