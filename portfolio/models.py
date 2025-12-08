# portfolio/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone

User = get_user_model()

# =========================
# PROFILE (multi-user ready)
# =========================
class Profile(models.Model):
    # kept nullable to avoid extra migration pain for now
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)
    username = models.SlugField(max_length=120, unique=True, blank=True)  # Public URL slug
    role = models.CharField(max_length=100, blank=True)
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    photo = models.ImageField(upload_to='profile/', blank=True, null=True)
    resume = models.FileField(upload_to="resume/", null=True, blank=True)

    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Auto-generate unique username slug if empty
        if not self.username:
            base = self.name or (self.user.username if self.user else 'user')
            slug = slugify(base)
            orig = slug
            c = 1
            while Profile.objects.filter(username=slug).exclude(pk=self.pk).exists():
                slug = f"{orig}-{c}"
                c += 1
            self.username = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# =========================
# SKILL
# =========================
class Skill(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="skills",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    category = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        owner = (
            getattr(self.profile, "username", None)
            or getattr(self.profile, "name", None)
            or "No owner"
        )

        category = self.category if self.category else "General"

        return f"{self.name} ({category}) — {owner}"

# =========================
# EXPERIENCE
# =========================
class Experience(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="experiences",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.CharField(max_length=50)
    end_date = models.CharField(max_length=50, blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ("-is_current", "order")

    def save(self, *args, **kwargs):
        if self.is_current:
            self.end_date = "Present"
        super().save(*args, **kwargs)

    def __str__(self):
        owner = (
            getattr(self.profile, "username", None)
            or getattr(self.profile, "name", None)
            or "No owner"
        )
        return f"{self.role} @ {self.company} — {owner}"


# =========================
# PROJECT
# =========================
class Project(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="projects",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tech_stack = models.CharField(max_length=200, blank=True)
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    project_image = models.ImageField(upload_to="projects/", blank=True, null=True)
    highlight = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("order", "-created_at")

    def __str__(self):
        owner = (
            getattr(self.profile, "username", None)
            or getattr(self.profile, "name", None)
        )
        if owner:
            return f"{self.title} — {owner}"
        return self.title


# =========================
# CONTACT MESSAGE
# =========================
class ContactMessage(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="contact_messages",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Mark if the owner has read this message
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        who = self.profile.username if self.profile else "unknown"
        return f"Message from {self.name} to {who}"


# =========================
# CERTIFICATION
# =========================
class Certification(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="certifications",
        on_delete=models.CASCADE,
        null=True,       # FIXED
        blank=True       # FIXED
    )

    name = models.CharField(max_length=255, null=True, blank=True)
    issuer = models.CharField(max_length=255, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=255, blank=True)
    credential_url = models.URLField(blank=True)

    def __str__(self):
        owner = getattr(self.profile, "username", None) or getattr(
            self.profile, "name", ""
        )
        if owner:
            return f"{self.name} — {owner}"
        return self.name


# =========================
# WHY HIRE ME
# =========================
class WhyHireMe(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="whyhiremes",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=10, blank=True, null=True)
    priority = models.IntegerField(default=0)

    class Meta:
        ordering = ['priority']

    def __str__(self):
        owner = (
            getattr(self.profile, "username", None)
            or getattr(self.profile, "name", None)
            or "No owner"
        )
        return f"{self.title} — {owner}"


# =========================
# AI PROFILE DUMP
# =========================
class AIProfile(models.Model):
    profile = models.ForeignKey(
        Profile,
        related_name="ai_profiles",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    about_me = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    projects = models.TextField(blank=True)
    certifications = models.TextField(blank=True)
    achievements = models.TextField(blank=True)

    def __str__(self):
        return f"AI Profile Data for {self.profile.username if self.profile else 'unknown'}"

