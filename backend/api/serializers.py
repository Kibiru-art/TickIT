# serializers.py - Complete with Ticket, Client, Technician, and Profile serializers

from rest_framework import serializers
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.password_validation import validate_password
from .models import Client, Technician, Ticket, Attachment

User = get_user_model()  # Gets the active User model (custom or default)

# ======================= EXISTING SERIALIZERS (unchanged) =======================

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'department']

class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = ['id', 'name', 'email', 'phone', 'specialty']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'name', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class TicketSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_data = serializers.DictField(write_only=True, required=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['ticket_number', 'created_at', 'updated_at']

    def create(self, validated_data):
        client_info = validated_data.pop('client_data')
        client, _ = Client.objects.get_or_create(
            email=client_info.get('email'),
            defaults={
                'name': client_info.get('name', ''),
                'phone': client_info.get('phone', ''),
                'department': client_info.get('department', ''),
            }
        )
        validated_data['client'] = client
        validated_data.pop('attachments', None)
        return Ticket.objects.create(**validated_data)

# ======================= NEW PROFILE MANAGEMENT SERIALIZERS =======================

class UserProfileSerializer(serializers.ModelSerializer):
    """Read-only view of user profile (non‑sensitive fields)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']

    # If you have custom fields like 'name', 'phone', 'specialty' on your User model,
    # add them here. For standard Django User, we use first_name and last_name.
    # If you have a custom profile model, adjust accordingly.


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Update user profile – only editable fields"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name']   # Add 'phone', 'specialty' if on User model
        # If your User model has extra fields (e.g., phone, specialty), include them.

    # Optional: if you have a one‑to‑one Profile model, use a different serializer.
    # For simplicity, we assume extra fields are on the User model.
    # If not, you can remove this serializer and use UserProfileSerializer with partial=True.


class ChangePasswordSerializer(serializers.Serializer):
    """Change user password with old password verification"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        # Use Django's built‑in password validators
        validate_password(value)
        return value

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class ChangeEmailSerializer(serializers.Serializer):
    """Change email address (requires password confirmation)"""
    new_email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate_new_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password is incorrect.")
        return value