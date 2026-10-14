from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # Файл хүлээж авахад шаардлагатай

    def get_queryset(self):
        user = self.request.user
        proposal_id = self.request.query_params.get('proposal', None)
        queryset = Document.objects.all()

        # Шүүлт хийх: proposal ID ирвэл зөвхөн тухайн хүсэлтийн файлуудыг буцаана
        if proposal_id:
            queryset = queryset.filter(proposal_id=proposal_id)

        if user.role in [user.Role.SECRETARY, user.Role.CHAIR, user.Role.REVIEWER] or user.is_staff:
            return queryset.order_by('-uploaded_at')
        
        # Судлаач зөвхөн өөрийн хүсэлтийн файлуудыг харна
        return queryset.filter(proposal__researcher=user).order_by('-uploaded_at')
