from django.db import models

class Profile(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    summary = models.TextField()
    location = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    photo = models.ImageField(upload_to='profile/', blank=True, null=True)  # NEW
    resume = models.FileField(upload_to="resume/", null=True, blank=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.CharField(max_length=200)  # e.g. "Django, React, Azure"
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    highlight = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    

    def __str__(self):
        return f"Message from {self.name}"

