from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from groq import Groq

from .models import (
    Profile,
    Project,
    ContactMessage,
    Skill,
    Experience,
    Certification,
    WhyHireMe,
    AIProfile
)

from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    ContactMessageSerializer,
    SkillSerializer,
    ExperienceSerializer,
    CertificationSerializer,
    WhyHireMeSerializer
)

# ===========================================
# PROFILE
# ===========================================
class ProfileDetailAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()


# ===========================================
# PROJECTS
# ===========================================
class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.all().order_by("-id")
    serializer_class = ProjectSerializer


# ===========================================
# SKILLS
# ===========================================
class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by("category", "name")
    serializer_class = SkillSerializer


# ===========================================
# EXPERIENCE
# ===========================================
class ExperienceListAPIView(generics.ListAPIView):
    queryset = Experience.objects.all().order_by("-id")
    serializer_class = ExperienceSerializer


# ===========================================
# CERTIFICATIONS
# ===========================================
class CertificationListAPIView(generics.ListAPIView):
    queryset = Certification.objects.all().order_by("-id")
    serializer_class = CertificationSerializer


# ===========================================
# WHY HIRE ME
# ===========================================
class WhyHireMeList(generics.ListAPIView):
    queryset = WhyHireMe.objects.all()
    serializer_class = WhyHireMeSerializer


# ===========================================
# CONTACT FORM
# ===========================================
class ContactCreateAPIView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Message sent successfully"}, status=201)

        return Response(
            {"error": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


# ===========================================
# AI CHATBOT — DYNAMIC USING DATABASE
# ===========================================

def build_dynamic_context():
    """ Collect ALL info from DB and return as long text for the AI """
    context = {}

    # Profile
    profile = Profile.objects.first()
    if profile:
        context["profile"] = (
            f"Name: {profile.name}, Role: {profile.role}, Summary: {profile.summary}"
        )

    # Skills
    skills = Skill.objects.all().values_list("name", flat=True)
    context["skills"] = ", ".join(skills)

    # Experience
    exp = Experience.objects.all()
    context["experience"] = " | ".join([f"{e.title} at {e.company}" for e in exp])

    # Projects
    projects = Project.objects.all()
    context["projects"] = " | ".join([p.title for p in projects])

    # Certifications
    certs = Certification.objects.all()
    context["certifications"] = " | ".join([c.name for c in certs])

    # Why hire me
    why = WhyHireMe.objects.all()
    context["whyhireme"] = " | ".join([item.title for item in why])

    # AI Profile (extra resume content)
    ai = AIProfile.objects.first()
    if ai:
        context["ai_profile"] = (
            f"About Me: {ai.about_me}\nSkills: {ai.skills}\nExperience: {ai.experience}\n"
            f"Projects: {ai.projects}\nCertifications: {ai.certifications}\nAchievements: {ai.achievements}"
        )
    else:
        context["ai_profile"] = ""

    return context


class ChatbotAPIView(APIView):

    def post(self, request):
        user_message = request.data.get("message")
        history = request.data.get("history", [])

        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # Load dynamic context
        context = build_dynamic_context()

        system_prompt = f"""
You are Vijay Saw’s AI Assistant.
Use ONLY the following verified profile/resume data:

Profile: {context['profile']}
Skills: {context['skills']}
Experience: {context['experience']}
Projects: {context['projects']}
Certifications: {context['certifications']}
Why Hire Me: {context['whyhireme']}
Additional AI Profile Details: {context['ai_profile']}

ALWAYS answer based on this information.
"""

        # Build message history for conversation
        messages = [{"role": "system", "content": system_prompt}]

        for msg in history:
            role = "assistant" if msg["sender"] == "bot" else "user"
            messages.append({"role": role, "content": msg["text"]})

        messages.append({"role": "user", "content": user_message})

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

