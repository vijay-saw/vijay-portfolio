from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import (
    Profile,
    Project,
    ContactMessage,
    Skill,
    Experience,
    Certification,
    WhyHireMe,
    AIProfile,
)

from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    ContactMessageSerializer,
    SkillSerializer,
    ExperienceSerializer,
    CertificationSerializer,
    WhyHireMeSerializer,
)

import os
from groq import Groq


# ============================================================
# PROFILE
# ============================================================
class ProfileDetailAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()


# ============================================================
# PROJECTS
# ============================================================
class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer


# ============================================================
# SKILLS
# ============================================================
class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by("category", "name")
    serializer_class = SkillSerializer


# ============================================================
# EXPERIENCE
# ============================================================
class ExperienceListAPIView(generics.ListAPIView):
    queryset = Experience.objects.all().order_by("-id")
    serializer_class = ExperienceSerializer


# ============================================================
# CERTIFICATIONS
# ============================================================
class CertificationListAPIView(generics.ListAPIView):
    queryset = Certification.objects.all().order_by("-id")
    serializer_class = CertificationSerializer


# ============================================================
# WHY HIRE ME
# ============================================================
class WhyHireMeList(generics.ListAPIView):
    queryset = WhyHireMe.objects.all()
    serializer_class = WhyHireMeSerializer


# ============================================================
# CONTACT FORM (CLEANED)
# ============================================================
class ContactCreateAPIView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": "Message sent successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"error": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# CHATBOT — WITH CSRF EXEMPTION + HISTORY + AI PROFILE
# ============================================================

@method_decorator(csrf_exempt, name="dispatch")
class ChatbotAPIView(APIView):

    def post(self, request):
        history = request.data.get("history", [])

        # Load AI resume/profile data from DB
        ai_data = AIProfile.objects.first()

        if not ai_data:
            return Response({"error": "AI profile data not found"}, status=500)

        resume_info = f"""
About Me:
{ai_data.about_me}

Skills:
{ai_data.skills}

Experience:
{ai_data.experience}

Projects:
{ai_data.projects}

Certifications:
{ai_data.certifications}

Achievements:
{ai_data.achievements}
"""

        # Construct conversational messages
        messages = [
            {
                "role": "system",
                "content": (
                    "You are Vijay Saw’s personal AI assistant. "
                    "Use the following resume/profile data when answering questions:\n\n"
                    f"{resume_info}"
                ),
            }
        ]

        for msg in history:
            role = "assistant" if msg["sender"] == "bot" else "user"
            messages.append({"role": role, "content": msg["text"]})

        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages
            )

            reply = response.choices[0].message.content
            return Response({"reply": reply})

        except Exception as e:
            return Response({"error": str(e)}, status=500)

