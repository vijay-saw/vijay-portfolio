# portfolio/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions


class SafeJWTAuthentication(JWTAuthentication):
    """
    Custom JWT auth that makes sure the user actually exists and is active.
    If the user was deleted or deactivated after the token was issued,
    we reject the token.
    """

    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        # If user is missing or inactive, treat token as invalid
        if user is None or not user.is_active:
            raise exceptions.AuthenticationFailed(
                "User no longer exists or is inactive.",
                code="user_deleted",
            )

        return user

