from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import UserSerializer

User = get_user_model()


# 1. JWT Токен авахад хэрэглэгчийн ролийг JSON хариунд хавсаргах Custom Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Нэвтрэхэд фронтэнд рүү шууд user объектыг буцаана
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        return data


# 2. Шинэчилсэн Custom Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# 3. Нэвтэрсэн хэрэглэгчийн өөрийн мэдээллийг авах View (/users/me/ болон /users/profile/)
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# 4. Хэрэглэгчдийн жагсаалт болон шинэ хэрэглэгч үүсгэх View
class UserListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        # GET хүсэлтийн query parameter-ээс role-ийг авна (жишээ нь: /api/users/?role=REVIEWER)
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset


# 5. Хэрэглэгчийн мэдээллийг засах, устгах View
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
