# portfolio/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.conf import settings

from rest_framework.permissions import AllowAny
import requests
import json

from .models import Profile, Skill, Project, Experience, Certification, WhyHireMe, AIProfile, ContactMessage
from .serializers import (
    ProfileSerializer, SkillSerializer, ProjectSerializer,
    ExperienceSerializer, CertificationSerializer, WhyHireMeSerializer,
    AIProfileSerializer, ContactMessageSerializer
)

# helper to ensure a user always has a profile object
def ensure_profile_for_user(user):
    profile = None
    if hasattr(user, "profile") and user.profile:
        profile = user.profile
    else:
        profile = Profile.objects.create(
            user=user,
            name=(user.get_full_name() or user.username),
            email=(user.email or "")
        )
    return profile

# ---------------------------
# ProfileViewSet
# ---------------------------
class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        profile = ensure_profile_for_user(request.user)
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def partial_update(self, request):
        profile = ensure_profile_for_user(request.user)
        data = request.data.copy()
        serializer = ProfileSerializer(profile, data=data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# ---------------------------
# Base class for user-owned objects
# ---------------------------
class UserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_profile(self):
        return ensure_profile_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(profile=self.get_profile())

    def get_queryset(self):
        qs = self.queryset
        return qs.filter(profile=self.get_profile())

    def bulk_update(self, request, *args, **kwargs):
        """
        Generic bulk-replace handler for collection PUT requests.

        Expects a list of items in the request body. Example:
          PUT /api/skills/  -> body: [ { "name": "React", "level": "Advanced" }, ... ]

        Behavior:
          - Validate the list with the viewset serializer (many=True).
          - Delete existing user-owned objects for this profile.
          - Create new objects linked to the user's profile.
          - Return the newly created objects serialized.
        """
        data = request.data

        if not isinstance(data, list):
            return Response({"detail": "Expected a list of items for bulk update."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Validate input using serializer (many=True)
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)

        model_class = getattr(self.queryset, 'model', None)
        if model_class is None:
            return Response({"detail": "Server misconfiguration: cannot determine model class."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        profile = self.get_profile()

        # Perform delete + create in a transaction to avoid intermediate inconsistent state
        created_objs = []
        with transaction.atomic():
            # delete existing items for profile
            self.get_queryset().delete()

            # build objects from validated data and bulk create
            validated = serializer.validated_data  # list of dicts
            objs_to_create = []
            for item in validated:
                # Merge in profile foreign key
                objs_to_create.append(model_class(profile=profile, **item))

            if objs_to_create:
                model_class.objects.bulk_create(objs_to_create)
                # fetch the newly created queryset for serialization
                new_qs = model_class.objects.filter(profile=profile)
            else:
                new_qs = model_class.objects.none()

        # Serialize newly created objects
        out_serializer = self.get_serializer(new_qs, many=True, context={"request": request})
        return Response(out_serializer.data, status=status.HTTP_200_OK)

# ---------------------------
# Child viewsets
# ---------------------------
class SkillViewSet(UserOwnedViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class ProjectViewSet(UserOwnedViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ExperienceViewSet(UserOwnedViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

class CertificationViewSet(UserOwnedViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer

class WhyHireMeViewSet(UserOwnedViewSet):
    queryset = WhyHireMe.objects.all()
    serializer_class = WhyHireMeSerializer

class AIProfileViewSet(UserOwnedViewSet):
    queryset = AIProfile.objects.all()
    serializer_class = AIProfileSerializer

# ---------------------------
# Public profiles
# ---------------------------
from rest_framework import mixins

class PublicProfileViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProfileSerializer
    lookup_field = "username"

    def get_queryset(self):
        return Profile.objects.filter(public=True)

# ---------------------------
# Contact messages
# ---------------------------
# ---------------------------
# Contact messages
# ---------------------------
class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()

        profile = getattr(user, "profile", None)
        if not profile:
            return qs.none()

        return qs.filter(profile=profile)

    def perform_create(self, serializer):
        owner_username = self.request.data.get("owner_username")

        profile = None
        if owner_username:
            profile = (
                Profile.objects.filter(user__username=owner_username).first()
                or Profile.objects.filter(username=owner_username).first()
            )

        serializer.save(profile=profile)

    # 👇 NEW: mark as read
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if not message.is_read:
            message.is_read = True
            message.save(update_fields=["is_read"])
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------
# Site owner public profile (default homepage data)
# ---------------------------
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_profile(request):
    """
    Public endpoint that returns ONLY the site owner's profile.

    The site owner username is configured in settings.DEFAULT_OWNER_USERNAME.
    This will be used by the frontend default homepage to show *your* portfolio.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response(
            {"detail": "DEFAULT_OWNER_USERNAME is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    profile = get_object_or_404(Profile, user__username=username)
    serializer = ProfileSerializer(profile, context={"request": request})
    return Response(serializer.data)
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_whyhireme(request):
    """
    Public endpoint: returns WhyHireMe items for the site owner only.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response({"detail": "DEFAULT_OWNER_USERNAME missing"}, status=500)

    profile = get_object_or_404(Profile, user__username=username)
    items = profile.whyhiremes.all().order_by("priority")

    serializer = WhyHireMeSerializer(items, many=True)
    return Response(serializer.data)



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_skills(request):
    """
    Public endpoint: returns Skills for the site owner only.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response({"detail": "DEFAULT_OWNER_USERNAME missing"}, status=500)

    profile = get_object_or_404(Profile, user__username=username)
    items = profile.skills.all().order_by("order")

    serializer = SkillSerializer(items, many=True)
    return Response(serializer.data)



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_experience(request):
    """
    Public endpoint: returns Experience for the site owner only.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response({"detail": "DEFAULT_OWNER_USERNAME missing"}, status=500)

    profile = get_object_or_404(Profile, user__username=username)
    items = profile.experiences.all().order_by("order")

    serializer = ExperienceSerializer(items, many=True)
    return Response(serializer.data)



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_projects(request):
    """
    Public endpoint: returns Projects for the site owner only.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response({"detail": "DEFAULT_OWNER_USERNAME missing"}, status=500)

    profile = get_object_or_404(Profile, user__username=username)
    items = profile.projects.all().order_by("order", "-created_at")

    serializer = ProjectSerializer(items, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_certifications(request):
    """
    Public endpoint: returns Certifications for the site owner only.
    """
    username = getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    if not username:
        return Response({"detail": "DEFAULT_OWNER_USERNAME missing"}, status=500)

    profile = get_object_or_404(Profile, user__username=username)
    items = profile.certifications.all().order_by("-issue_date")

    serializer = CertificationSerializer(items, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def site_owner_ai(request):
    username = settings.DEFAULT_OWNER_USERNAME
    profile = get_object_or_404(Profile, user__username=username)
    ai = profile.ai_profiles.first()

    if not ai:
        return Response({})  # no AI data yet

    serializer = AIProfileSerializer(ai)
    return Response(serializer.data)





@api_view(["POST"])
@permission_classes([AllowAny])
def chat_with_ai(request):
    """
    Chat endpoint used by the floating chatbot.

    Uses Groq (OpenAI-compatible API) to generate answers.
    It is multi-user because it reads `owner_username` and pulls
    that user's portfolio data as context.
    """
    owner_username = (
        request.data.get("owner_username")
        or getattr(settings, "DEFAULT_OWNER_USERNAME", None)
    )

    # ---------- 1) Resolve profile + AIProfile ----------
    profile = None
    if owner_username:
        profile = (
            Profile.objects.filter(user__username=owner_username).first()
            or Profile.objects.filter(username=owner_username).first()
        )

    ai_profile = None
    if profile:
        ai_profile = AIProfile.objects.filter(profile=profile).first()

    name = profile.name if profile else "the portfolio owner"

    def safe(val):
        return val or ""

    # Core profile fields
    role = safe(getattr(profile, "role", ""))
    summary = safe(getattr(profile, "summary", ""))
    location = safe(getattr(profile, "location", ""))

    # Related objects
    skills_qs = profile.skills.all() if profile else []
    exp_qs = profile.experiences.all() if profile else []
    proj_qs = profile.projects.all() if profile else []
    cert_qs = profile.certifications.all() if profile else []

    skills_text = ", ".join(sorted({s.name for s in skills_qs if s.name})) or "not specified"
    exp_text = "; ".join(
        f"{e.role} at {e.company}" for e in exp_qs if e.role and e.company
    ) or "not specified yet"
    proj_text = "; ".join(p.title for p in proj_qs if p.title) or "no projects listed yet"
    cert_text = "; ".join(c.title for c in cert_qs if c.title) or "no certifications listed yet"

    # AIProfile extras
    about_ai = safe(getattr(ai_profile, "about_me", ""))
    ai_skills = safe(getattr(ai_profile, "skills", ""))
    ai_experience = safe(getattr(ai_profile, "experience", ""))
    ai_projects = safe(getattr(ai_profile, "projects", ""))
    ai_achievements = safe(getattr(ai_profile, "achievements", ""))

    user_message = (request.data.get("message") or "").strip()
    history = request.data.get("history", [])

    # ---------- 2) Build portfolio context ----------
    context_parts = [
        f"Owner name: {name}",
        f"Role/title: {role}",
        f"Summary: {summary}",
        f"Location: {location}",
        f"Skills (from DB): {skills_text}",
        f"Experience (from DB): {exp_text}",
        f"Projects (from DB): {proj_text}",
        f"Certifications (from DB): {cert_text}",
    ]

    if about_ai:
        context_parts.append(f"About me: {about_ai}")
    if ai_skills:
        context_parts.append(f"Skills (AIProfile): {ai_skills}")
    if ai_experience:
        context_parts.append(f"Experience (AIProfile): {ai_experience}")
    if ai_projects:
        context_parts.append(f"Projects (AIProfile): {ai_projects}")
    if ai_achievements:
        context_parts.append(f"Achievements: {ai_achievements}")

    portfolio_context = "\n".join(context_parts)

    # Convert history to LLM format
    history_messages = []
    for item in history:
        role_msg = "user" if item.get("sender") == "user" else "assistant"
        history_messages.append({"role": role_msg, "content": item.get("text", "")})

    system_prompt = (
        f"You are an AI assistant for the portfolio of {name}.\n"
        f"Use ONLY the following portfolio data as the main source of truth:\n\n"
        f"{portfolio_context}\n\n"
        f"- Be concise and friendly.\n"
        f"- Focus on the owner's skills, experience, projects, certifications, and career.\n"
        f"- If something is not in the data, say you don't know instead of making it up."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        *history_messages,
        {"role": "user", "content": user_message},
    ]

    # ---------- 3) Groq call ----------
    groq_key = getattr(settings, "GROQ_API_KEY", "")

    if not groq_key:
        # Fallback if env var not set
        reply = (
            "The AI backend is not fully configured yet, but here is a summary:\n\n"
            f"Role: {role}\n"
            f"Skills: {skills_text}\n"
            f"Experience: {exp_text}\n"
            f"Projects: {proj_text}\n"
            f"Certifications: {cert_text}\n\n"
            f"You asked: \"{user_message}\"."
        )
        return Response({"reply": reply})

    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps(
                {
                    "model": "llama-3.1-8b-instant",  # you can change to 8b for cheaper/faster
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 512,
                }
            ),
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        reply = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not reply:
            reply = "I couldn't generate a reply, please try again."
    except Exception as e:
        print("Groq chat error:", e)
        reply = (
            "There was an error talking to the AI service. "
            "Please try again later."
        )

    return Response({"reply": reply})

