import uuid
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from notifications.models import Notification
from .models import Proposal
from .serializers import ProposalSerializer

User = get_user_model()


class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user or user.is_anonymous:
            return Proposal.objects.none()

        base_queryset = Proposal.objects.prefetch_related(
            "reviewers", "reviews", "documents"
        ).order_by("-created_at")

        if self.action == "retrieve":
            return base_queryset

        user_role = str(getattr(user, "role", "")).upper()

        # 1. SECRETARY, CHAIR болон Супер хэрэглэгч бүх хүсэлтийг харна
        if (
            user.is_staff
            or user.is_superuser
            or user_role in ["SECRETARY", "CHAIR", "SECRETARY_CHAIR"]
        ):
            return base_queryset

        # 2. REVIEWER: Өөрт нь томилогдсон ЭСВЭЛ өөрийнх нь үүсгэсэн (Researcher) хүсэлтүүдийг цуг харна
        if user_role == "REVIEWER":
            return base_queryset.filter(
                Q(reviewers=user) | Q(researcher=user)
            ).distinct()

        # 3. RESEARCHER: Өөрийн үүсгэсэн хүсэлтийг харна
        return base_queryset.filter(researcher=user)

    def perform_create(self, serializer):
        user = self.request.user
        app_no = f"IRB-2026-{uuid.uuid4().hex[:6].upper()}"
        serializer.save(researcher=user, application_no=app_no)

    @action(detail=False, methods=["get"], url_path="reviewers")
    def get_reviewers(self, request):
        """
        Томилж болох бүх шүүмжлэгчдийн жагсаалтыг буцаана.
        REVIEWER-ээс гадна CHAIR, SECRETARY болон Superuser нарыг давхар оруулна.
        """
        reviewers = User.objects.filter(
            Q(role__in=["REVIEWER", "CHAIR", "SECRETARY"]) | Q(is_superuser=True)
        ).distinct()

        data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
            }
            for u in reviewers
        ]
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="assign-reviewer")
    def assign_reviewer(self, request, pk=None):
        proposal = self.get_object()
        reviewer_id = request.data.get("reviewer_id")

        if not reviewer_id:
            return Response(
                {"error": "reviewer_id шаардлагатай."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reviewer = User.objects.get(id=reviewer_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Сонгосон шүүмжлэгч олдсонгүй."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Шүүмжлэгчийг proposal-д нэмэх (ManyToMany)
        proposal.reviewers.add(reviewer)

        # Статусыг хянагдаж байгаа (UNDER_REVIEW) болгох
        if hasattr(proposal, "status") and proposal.status != "UNDER_REVIEW":
            proposal.status = "UNDER_REVIEW"
            proposal.save()

        # Мэдэгдэл үүсгэх
        try:
            Notification.objects.create(
                recipient=reviewer,
                title="Шинэ судалгааны хүсэлт томилогдлоо",
                message=f"Та '{proposal.title[:30]}' хүсэлтэд шүүмжлэгчээр томилогдлоо.",
            )
        except Exception as e:
            print("Notification error:", e)

        serializer = self.get_serializer(proposal)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
