# api/views_auth.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import Technician
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        name = request.data.get('name')
        phone = request.data.get('phone', '')
        specialty = request.data.get('specialty', '')

        # Basic validation
        if not username or not password or not email:
            return Response({'error': 'Username, password and email are required'},
                            status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Create Django user
        user = User.objects.create_user(username=username, password=password, email=email)

        # Create Technician profile
        technician = Technician.objects.create(
            user=user,
            name=name or username,
            email=email,
            phone=phone,
            specialty=specialty
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Return tokens and user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': technician.name,
            'phone': technician.phone,
            'specialty': technician.specialty,
        }

        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'user': user_data,
        }, status=status.HTTP_201_CREATED)


# Simple wrapper for login – you could also use TokenObtainPairView directly in urls
def login(request):
    return TokenObtainPairView.as_view()(request)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
            # For superuser without technician profile
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.username,
                'phone': '',
                'specialty': '',
            }
        return Response(data)