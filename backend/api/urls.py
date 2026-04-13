from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    TicketViewSet, ProfileView, ChangePasswordView, ChangeEmailView,
    debug_storage  # <-- import the debug view
)
from .views_auth import RegisterView, LogoutView, GetCurrentUserView

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', GetCurrentUserView.as_view(), name='current-user'),

    # Profile management endpoints
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/change-email/', ChangeEmailView.as_view(), name='change-email'),

    # Debug endpoint (temporary) – remove later
    path('debug-storage/', debug_storage, name='debug-storage'),
]