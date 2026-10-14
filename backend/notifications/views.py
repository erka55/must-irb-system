from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Зөвхөн тухайн нэвтэрсэн хэрэглэгчийн мэдэгдлүүдийг харуулна
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post', 'get'])
    def mark_as_read(self, request, pk=None):
        """Мэдэгдлийг уншсан төлөвт оруулах"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"detail": "Мэдэгдэл уншсан төлөвт шилжлээ."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post', 'get'])
    def mark_all_as_read(self, request):
        """Бүх мэдэгдлийг нэг дор уншсан болгох"""
        self.get_queryset().update(is_read=True)
        return Response({"detail": "Бүх мэдэгдэл уншсан төлөвт шилжлээ."}, status=status.HTTP_200_OK)
