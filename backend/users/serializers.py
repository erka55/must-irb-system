from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. Зайлшгүй шаардлагатай UserSerializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']

# 2. JWT Токений Payload дээр хэрэглэгчийн мэдээллийг данхах Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': getattr(self.user, 'role', 'RESEARCHER'),
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        return data
