from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserProfileView,
    UserListView,
    UserDetailView,
)

app_name = 'users'

urlpatterns = [
    # Токен авах болон шинэчлэх (Login / Refresh)
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Одоогийн нэвтэрсэн хэрэглэгчийн профайл татах эндпойнтууд
    path('me/', UserProfileView.as_view(), name='user_me'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # Хэрэглэгчдийн удирдлага (List, Create, Detail, Update)
    path('', UserListView.as_view(), name='user_list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
