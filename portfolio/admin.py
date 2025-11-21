from django.contrib import admin
from django import forms
from .models import Profile, Project, ContactMessage, Skill, Experience
from .models import Certification
from .models import WhyHireMe
from django.contrib import admin
from .models import AIProfile
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


@admin.register(WhyHireMe)
class WhyHireMeAdmin(admin.ModelAdmin):
    list_display = ("title", "priority")


admin.site.register(Experience, ExperienceAdmin)
admin.site.register(Skill)
admin.site.register(Profile)
admin.site.register(Project)
admin.site.register(ContactMessage)
admin.site.register(Certification)
admin.site.register(AIProfile)
