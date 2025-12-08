# portfolio/auth_serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from django.apps import apps
from django.db import models as djmodels

Profile = apps.get_model("portfolio", "Profile")

class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def _profile_create_kwargs(self, display_name):
        """
        Build a kwargs dict for Profile.objects.create(...) using fields that actually exist
        on the Profile model. This makes the serializer robust to different Profile schemas.
        """
        kwargs = {"user": None}  # we'll set user after creating it
        # collect concrete field names from the Profile model
        concrete_fields = [f.name for f in Profile._meta.get_fields() if getattr(f, "concrete", False)]
        # common candidate fields to set if present
        candidates = {
            "display_name": display_name,
            "name": display_name,
            "full_name": display_name,
            "email": self.initial_data.get("email", ""),
        }
        for field_name, value in candidates.items():
            if field_name in concrete_fields:
                kwargs[field_name] = value
        return kwargs

    @transaction.atomic
    def create(self, validated_data):
        """
        Create a new User and a corresponding Profile, mapping fields dynamically.
        Returns the created User object (not the profile), to keep integration simple.
        """
        full_name = validated_data.get("full_name", "").strip()
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        # create user
        user = User.objects.create_user(username=username, email=email, password=password)

        # set first/last name if full_name provided
        if full_name:
            parts = full_name.split(" ", 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
            user.save()

        # prepare kwargs using only Profile fields that exist
        display_name = full_name or username
        profile_kwargs = self._profile_create_kwargs(display_name)

        # assign user and create profile
        profile_kwargs["user"] = user
        try:
            Profile.objects.create(**profile_kwargs)
        except TypeError:
            # Fallback: try minimal create (user only)
            try:
                Profile.objects.create(user=user)
            except Exception:
                # if profile creation fails, rollback user creation
                user.delete()
                raise

        return user

