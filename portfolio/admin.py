from django.contrib import admin
from django import forms
from .models import Profile, Project, ContactMessage, Skill, Experience
from .models import Certification

class ExperienceForm(forms.ModelForm):
    class Meta:
        model = Experience
        fields = "__all__"

    def clean(self):
        cleaned = super().clean()
        if cleaned.get("is_current"):
            cleaned["end_date"] = "Present"
        return cleaned


class ExperienceAdmin(admin.ModelAdmin):
    form = ExperienceForm

    class Media:
        js = ("admin/experience.js",)  # load custom JS for UI behavior


admin.site.register(Experience, ExperienceAdmin)
admin.site.register(Skill)
admin.site.register(Profile)
admin.site.register(Project)
admin.site.register(ContactMessage)
admin.site.register(Certification)

