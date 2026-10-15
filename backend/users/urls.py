from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileView,
    UserViewSet,
)

router = DefaultRouter()
# Router prefix-ийг 'all' болгоно -> Бүрэн зам нь: /api/users/all/
router.register(r'all', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),
]
