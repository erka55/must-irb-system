import uuid
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Proposal
from .serializers import ProposalSerializer
from notifications.models import Notification

User = get_user_model()


class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user or user.is_anonymous:
            return Proposal.objects.none()

        base_queryset = Proposal.objects.prefetch_related(
            'reviewers', 'reviews', 'documents'
        ).order_by('-created_at')

        # Дэлгэрэнгүй хуудас (Retrieve action) дуудагдахад тухайн Proposal-ийг буцааснаар 404 гарахгүй
        if self.action == 'retrieve':
            return base_queryset

        user_role = str(getattr(user, 'role', '')).upper()

        # 1. SECRETARY, CHAIR болон Супер хэрэглэгч бүх хүсэлтийг харна
        if user.is_staff or user.is_superuser or user_role in ['SECRETARY', 'CHAIR', 'SECRETARY_CHAIR']:
            return base_queryset

        # 2. REVIEWER: Өөрт нь томилогдсон хүсэлтүүдийг харна
        if user_role == 'REVIEWER':
            return base_queryset.filter(reviewers=user).distinct()

        # 3. RESEARCHER: Өөрийн үүсгэсэн хүсэлтүүдийг харна
        return base_queryset.filter(researcher=user)

    def perform_create(self, serializer):
        user = self.request.user
        app_no = f"IRB-2026-{uuid.uuid4().hex[:6].upper()}"
        serializer.save(researcher=user, application_no=app_no)

    @action(detail=True, methods=['post'], url_path='assign-reviewer')
    def assign_reviewer(self, request, pk=None):
        proposal = self.get_object()
        reviewer_id = request.data.get('reviewer_id')

        if not reviewer_id:
            return Response(
                {'error': 'reviewer_id шаардлагатай.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reviewer = User.objects.get(id=reviewer_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Сонгосон шүүмжлэгч хэрэглэгч олдсонгүй.'},
                status=status.HTTP_404_NOT_FOUND
            )

        proposal.reviewers.add(reviewer)

        if hasattr(proposal, 'status') and proposal.status != 'UNDER_REVIEW':
            proposal.status = 'UNDER_REVIEW'
            proposal.save()

        try:
            Notification.objects.create(
                recipient=reviewer,
                title="Шинэ судалгааны хүсэлт томилогдлоо",
                message=f"Та '{proposal.title[:30]}' хүсэлтэд шүүмжлэгчээр томилогдлоо."
            )
        except Exception as e:
            print("Notification error:", e)

        serializer = self.get_serializer(proposal)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
