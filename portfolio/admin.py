# portfolio/admin.py
from django.contrib import admin
from django import forms
from django.utils.html import format_html
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

# -----------------------
# Experience admin + form
# -----------------------
class ExperienceForm(forms.ModelForm):
    class Meta:
        model = Experience
        fields = "__all__"
    # No clean() override needed: model.save() already forces end_date="Present" for is_current


class ExperienceAdmin(admin.ModelAdmin):
    form = ExperienceForm
    list_display = ("role", "company", "is_current", "start_date", "end_date")
    list_filter = ("is_current", "company")
    search_fields = ("role", "company")

    class Media:
        js = ("admin/experience.js",)


# -----------------------
# Admin action: publish only (no approval)
# -----------------------
@admin.action(description="Publish selected profiles (set public=True)")
def publish_profiles(modeladmin, request, queryset):
    updated = queryset.update(public=True)
    modeladmin.message_user(request, f"{updated} profile(s) published.")


# -----------------------
# Profile admin  (NO is_approved)
# -----------------------
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "username", "user_display", "public", "created_at")
    list_filter = ("public",)
    search_fields = ("name", "username", "user__username", "email")
    actions = [publish_profiles]
    readonly_fields = ("created_at",)

    def user_display(self, obj):
        return obj.user.username if obj.user else format_html("<i>no user</i>")

    user_display.short_description = "User"


# ContactMessage admin
# -----------------------
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """
    Shows who sent the message, which portfolio/profile it belongs to,
    and when it was created.
    """
    list_display = ("name", "email", "profile", "is_read", "created_at")
    list_filter = ("profile", "is_read", "created_at")
    search_fields = ("name", "email", "message", "profile__username")
    readonly_fields = ("created_at",)

    # Quick toggle is_read from list page
    list_editable = ("is_read",)

    actions = ["mark_as_read", "mark_as_unread"]

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} message(s) marked as read.")
    mark_as_read.short_description = "Mark selected messages as read"

    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} message(s) marked as unread.")
    mark_as_unread.short_description = "Mark selected messages as unread"


# -----------------------
# Certification admin
# -----------------------
@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    """
    Show which certification, who it belongs to, and key metadata.
    """
    list_display = (
        "name",
        "issuer",
        "profile",       # whose cert is this
        "issue_date",
        "expiry_date",
        "credential_id",
    )
    list_filter = ("profile", "issuer", "issue_date", "expiry_date")
    search_fields = (
        "name",
        "issuer",
        "credential_id",
        "profile__username",
        "profile__user__email",
    )
    ordering = ("-issue_date", "-id")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "profile", "tech_stack", "highlight", "order", "created_at")
    list_filter = ("profile", "highlight")
    search_fields = (
        "title",
        "description",
        "tech_stack",
        "profile__username",
        "profile__user__email",
    )
    ordering = ("order", "-created_at")

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "profile", "level", "order")
    list_filter = ("profile", "category", "level")
    search_fields = (
        "name",
        "category",
        "level",
        "profile__username",
        "profile__user__email",
    )
    ordering = ("order", "name")


@admin.register(WhyHireMe)
class WhyHireMeAdmin(admin.ModelAdmin):
    list_display = ("title", "profile", "priority", "icon")
    list_filter = ("profile", "priority")
    search_fields = (
        "title",
        "description",
        "profile__username",
        "profile__user__email",
    )
    ordering = ("priority",)


# -----------------------
# Experience admin + form
# -----------------------
class ExperienceForm(forms.ModelForm):
    class Meta:
        model = Experience
        fields = "__all__"

    def clean(self):
        cleaned = super().clean()
        if cleaned.get("is_current"):
            cleaned["end_date"] = "Present"
        return cleaned


@admin.register(Experience)     # 👈 THIS REGISTERS THE MODEL
class ExperienceAdmin(admin.ModelAdmin):
    form = ExperienceForm
    
    list_display = (
        "role",
        "company",
        "profile",        # owner
        "is_current",
        "start_date",
        "end_date",
        "order",
    )

    list_filter = ("profile", "company", "is_current")

    search_fields = (
        "role",
        "company",
        "description",
        "profile__username",
        "profile__user__email",
    )

    ordering = ("-is_current", "order")

    class Media:
        js = ("admin/experience.js",)

# -----------------------
# Register other models
# -----------------------
admin.site.register(AIProfile)

