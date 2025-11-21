from django.db import models

# =========================
# PROFILE
# =========================
class Profile(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    summary = models.TextField()
    location = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    photo = models.ImageField(upload_to='profile/', blank=True, null=True)
    resume = models.FileField(upload_to="resume/", null=True, blank=True)

    def __str__(self):
        return self.name


# =========================
# SKILL
# =========================
class Skill(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.category} - {self.name}"


# =========================
# EXPERIENCE
# =========================
class Experience(models.Model):
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    start_date = models.CharField(max_length=50)
    end_date = models.CharField(max_length=50, blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()

    def save(self, *args, **kwargs):
        if self.is_current:
            self.end_date = "Present"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.role} @ {self.company}"


# =========================
# PROJECT
# =========================
class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.CharField(max_length=200)
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    project_image = models.ImageField(upload_to="projects/", blank=True, null=True)
    highlight = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)





# =========================
# CONTACT
# =========================
class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Certification(models.Model):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    date = models.CharField(max_length=50)

    certificate_file = models.FileField(
        upload_to="certifications/",
        blank=True,
        null=True
    )  # PDF or Image



class WhyHireMe(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=10, blank=True, null=True)  # for emojis or icons
    priority = models.IntegerField(default=0)  # ordering

    class Meta:
        ordering = ['priority']

class AIProfile(models.Model):
    about_me = models.TextField()
    skills = models.TextField()
    experience = models.TextField()
    projects = models.TextField()
    certifications = models.TextField()
    achievements = models.TextField()

    def __str__(self):
        return "AI Profile Data"

