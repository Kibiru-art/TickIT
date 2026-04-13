# api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.files.storage import default_storage
from django.conf import settings
import os
import cloudinary.uploader

from .models import Ticket, Client, Attachment, Technician
from .serializers import (
    TicketSerializer, ClientSerializer, TechnicianSerializer, AttachmentSerializer,
    UserProfileSerializer, UpdateProfileSerializer, ChangePasswordSerializer, ChangeEmailSerializer
)

User = get_user_model()

# ======================= TICKET VIEWSET =======================

class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Ticket.objects.filter(created_by=user).order_by('-created_at')
        return Ticket.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'client' in data and 'client_data' not in data:
            data['client_data'] = data.pop('client')
        if request.user.is_authenticated and hasattr(request.user, 'technician_profile'):
            data['technician'] = request.user.technician_profile.id
        else:
            data.pop('technician', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'status field required'}, status=400)
        valid_statuses = ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed']
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=400)
        ticket.status = new_status
        ticket.save()
        return Response({'status': ticket.status, 'message': 'Status updated successfully'})

    @action(detail=True, methods=['post'], url_path='attachments')
    def upload_attachments(self, request, pk=None):
        """Upload files directly to Cloudinary and store the URL in the Attachment model."""
        print("=" * 50)
        print("DEBUG: Uploading attachment manually to Cloudinary")
        print(f"DEBUG: CLOUDINARY_CLOUD_NAME = {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
        print("=" * 50)

        ticket = self.get_object()
        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

        attachments = []
        for file in files:
            try:
                upload_result = cloudinary.uploader.upload(file)
                cloudinary_url = upload_result['secure_url']
            except Exception as e:
                print(f"Cloudinary upload error: {e}")
                return Response({'error': f'Failed to upload file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            attachment = Attachment.objects.create(
                ticket=ticket,
                file=cloudinary_url,   # store the URL
                name=file.name
            )
            print(f"DEBUG: Saved file URL = {attachment.file}")

            attachments.append({
                'id': attachment.id,
                'name': attachment.name,
                'url': attachment.file,
                'uploaded_at': attachment.uploaded_at,
            })
        return Response({'attachments': attachments}, status=status.HTTP_201_CREATED)


# ======================= GET CURRENT USER VIEW =======================

class GetCurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            tech = user.technician_profile
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': tech.name,
                'phone': tech.phone,
                'specialty': tech.specialty,
            }
        except AttributeError:
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.username,
                'phone': '',
                'specialty': '',
            }
        return Response(data)


# ======================= PROFILE MANAGEMENT VIEWS =======================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            tech = user.technician_profile
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': tech.name,
                'phone': tech.phone,
                'specialty': tech.specialty,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        except AttributeError:
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.username,
                'phone': '',
                'specialty': '',
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        return Response(data)

    def patch(self, request):
        user = request.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            new_email = request.data['email']
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({'error': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email
        user.save()

        try:
            tech = user.technician_profile
            if 'name' in request.data:
                tech.name = request.data['name']
            if 'phone' in request.data:
                tech.phone = request.data['phone']
            if 'specialty' in request.data:
                tech.specialty = request.data['specialty']
            tech.save()
        except AttributeError:
            pass

        return self.get(request)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


class ChangeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeEmailSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.email = serializer.validated_data['new_email']
        user.save()
        return Response({"message": "Email changed successfully.", "email": user.email}, status=status.HTTP_200_OK)


# ======================= DEBUG VIEW (temporary) =======================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_storage(request):
    return Response({
        'cloudinary_cloud_name_from_settings': getattr(settings, 'CLOUDINARY', {}).get('cloud_name'),
        'default_storage_class': default_storage.__class__.__name__,
        'environment_variables': {
            'CLOUDINARY_CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
            'CLOUDINARY_API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
            'CLOUDINARY_API_SECRET': os.environ.get('CLOUDINARY_API_SECRET')[:5] + '...' if os.environ.get('CLOUDINARY_API_SECRET') else None,
        },
        'django_default_file_storage': getattr(settings, 'DEFAULT_FILE_STORAGE', None),
    })