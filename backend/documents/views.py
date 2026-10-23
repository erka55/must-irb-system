from rest_framework import viewsets, permissions, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        proposal_id = self.request.query_params.get('proposal', None)
        queryset = Document.objects.all()

        if proposal_id:
            queryset = queryset.filter(proposal_id=proposal_id)

        if user.role in [user.Role.SECRETARY, user.Role.CHAIR, user.Role.REVIEWER] or user.is_staff:
            return queryset.order_by('-uploaded_at')
        
        return queryset.filter(proposal__researcher=user).order_by('-uploaded_at')

    # ФАЙЛ НЭМЭХ ҮЕИЙН ШАЛГАЛТ
    def perform_create(self, serializer):
        proposal = serializer.validated_data['proposal']
        # Яг таны models.py дээрх статусуудыг ашиглана
        if proposal.status not in ['DRAFT', 'REVISION_REQUIRED']:
            raise PermissionDenied("Төслийг илгээсэн эсвэл хянагдаж байгаа тул файл нэмэх боломжгүй.")
        serializer.save()

    # ФАЙЛ УСТГАХ ҮЕИЙН ШАЛГАЛТ
    def perform_destroy(self, instance):
        if instance.proposal.status not in ['DRAFT', 'REVISION_REQUIRED']:
            raise PermissionDenied("Төслийг илгээсэн эсвэл хянагдаж байгаа тул файл устгах боломжгүй.")
        instance.delete()
