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

        user_role = getattr(user, 'role', '').upper()

        # 1. Судлаач зөвхөн өөрийн төслийг харна (Ноорог болон бусад)
        if user_role == 'RESEARCHER':
            return Proposal.objects.filter(researcher=user).order_by('-created_at')

        # 2. Дарга, Нарийн бичиг, Шүүмжлэгч нар:
        # Өөрийнхөө бүх төслийг (DRAFT байсан ч) БОЛОН бусдын илгээсэн (DRAFT биш) төслүүдийг харна
        if user_role in ['CHAIR', 'SECRETARY', 'REVIEWER']:
            return Proposal.objects.filter(
                Q(researcher=user) | ~Q(status='DRAFT')
            ).order_by('-created_at')

        # 3. Зөвхөн ADMIN эсвэл цэвэр Superuser бүх төслийг харна
        if user.is_superuser or user_role == 'ADMIN':
            return Proposal.objects.all().order_by('-created_at')

        return Proposal.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        app_no = f"IRB-2026-{uuid.uuid4().hex[:6].upper()}"
        serializer.save(researcher=user, application_no=app_no)

    @action(detail=True, methods=["post"], url_path="assign-reviewer")
    def assign_reviewer(self, request, pk=None):
        # Зөвхөн Нарийн бичиг, Дарга томилох эрхтэй
        if getattr(request.user, "role", "") not in [
            "CHAIR",
            "SECRETARY",
            "SECRETARY_CHAIR",
        ]:
            return Response(
                {
                    "error": "Зөвхөн Нарийн бичиг болон Дарга шүүмжлэгчийг томилох эрхтэй."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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

        # --- АШИГ СОНИРХЛЫН ЗӨРЧЛИЙН ШАЛГАЛТ (COI Check) ---
        if proposal.researcher_id == reviewer.id:
            return Response(
                {
                    "error": "Ашиг сонирхлын зөрчил: Судлаач өөрийн оруулсан төсөлд шүүмжлэгчээр томилогдох боломжгүй!"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        # ---------------------------------------------------

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

    @action(
        detail=True,
        methods=["post"],
        url_path="remove-reviewer",
        permission_classes=[permissions.IsAuthenticated],
    )
    def remove_reviewer(self, request, pk=None):
        proposal = self.get_object()

        # Зөвхөн Нарийн бичиг, Дарга хасах эрхтэй (Админыг хассан)
        if getattr(request.user, "role", "") not in [
            "CHAIR",
            "SECRETARY",
            "SECRETARY_CHAIR",
        ]:
            return Response(
                {"error": "Зөвхөн Нарийн бичиг болон Дарга шүүмжлэгчийг хасах эрхтэй."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
                {"error": "Заасан ID-тай шүүмжлэгч олдсонгүй."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 1. Review моделиос устгах (хэрэв байгаа бол)
        from reviews.models import Review

        Review.objects.filter(proposal=proposal, reviewer=reviewer).delete()

        # 2. Proposal-ийн reviewers M2M талбараас хасах (хэрэв байгаа бол)
        if hasattr(proposal, "reviewers"):
            proposal.reviewers.remove(reviewer)

        # Төслийн төлөвийг шинэчлэх (Хэрэв ямар ч шүүмжлэгч үлдээгүй бол төлөвийг буцааж SUBMITTED болгож болно)
        if hasattr(proposal, "reviewers") and proposal.reviewers.count() == 0:
            proposal.status = "SUBMITTED"
            proposal.save()

        return Response(
            {"detail": "Шүүмжлэгч амжилттай хасагдлаа."}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="submit")
    def submit_proposal(self, request, pk=None):
        """Ноорог (DRAFT) эсвэл засварт буцсан (REVISION_REQUIRED) төслийг албан ёсоор илгээх"""
        proposal = self.get_object()

        # Зөвхөн Судлаач өөрөө л төслөө илгээх эрхтэй
        if request.user != proposal.researcher:
            return Response(
                {"detail": "Та зөвхөн өөрийн үүсгэсэн төслийг илгээх эрхтэй."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Зөвхөн DRAFT эсвэл REVISION_REQUIRED үед л илгээж болно
        if proposal.status not in ["DRAFT", "REVISION_REQUIRED"]:
            return Response(
                {
                    "detail": f"Энэ төслийг илгээх боломжгүй (Одоогийн төлөв: {proposal.get_status_display()})."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Төлөвийг SUBMITTED болгож хадгалах
        proposal.status = "SUBMITTED"
        proposal.save()

        return Response(
            {
                "detail": "Төсөл амжилттай илгээгдлээ. Нарийн бичиг шалгаж эхлэх болно.",
                "status": proposal.status,
            },
            status=status.HTTP_200_OK,
        )


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
