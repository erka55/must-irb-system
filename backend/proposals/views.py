import uuid
from rest_framework import viewsets, permissions
from .models import Proposal
from .serializers import ProposalSerializer

class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Хэрэв Нарийн бичиг, Дарга, Шүүмжлэгч эсвэл Админ байвал бүх хүсэлтийг харна
        if user.role in [user.Role.SECRETARY, user.Role.CHAIR, user.Role.REVIEWER] or user.is_staff:
            return Proposal.objects.all().order_by('-created_at')
        # Судлаач бол зөвхөн өөрийн үүсгэсэн хүсэлтүүдийг харна
        return Proposal.objects.filter(researcher=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        # Дугаарыг автоматаар үүсгэнэ (Жишээ: IRB-2026-A1B2C3)
        app_no = f"IRB-2026-{uuid.uuid4().hex[:6].upper()}"
        
        # researcher болон application_no-г автоматаар олгоно
        serializer.save(
            researcher=user,
            application_no=app_no
        )
