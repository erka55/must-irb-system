import uuid
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, F  # <--- Энэ импортыг нэмсэн
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

        user_role = getattr(user, "role", "").upper()

        # 1. Үндсэн QuerySet-ийг хэрэглэгчийн дүрээр тодорхойлох
        if user_role == "RESEARCHER":
            base_queryset = Proposal.objects.filter(researcher=user).order_by(
                "-created_at"
            )
        elif user_role in ["CHAIR", "SECRETARY", "REVIEWER"]:
            base_queryset = Proposal.objects.filter(
                Q(researcher=user) | ~Q(status="DRAFT")
            ).order_by("-created_at")
        elif user.is_superuser or user_role == "ADMIN":
            base_queryset = Proposal.objects.all().order_by("-created_at")
        else:
            return Proposal.objects.none()

        # 2. Хурал товлох модалын шүүлтүүр (ready_for_meeting)
        ready_for_meeting = self.request.query_params.get("ready_for_meeting", None)
        if ready_for_meeting == "true":
            # Зөвхөн UNDER_REVIEW (эсвэл REVISION_REQUIRED байгаад дахин хэлэлцэх шаардлагатай бол энд нэмж болно) төслүүдийг авна
            base_queryset = base_queryset.filter(status="UNDER_REVIEW").annotate(
                total_assignments=Count("reviewers", distinct=True)
            )

            # Python түвшинд нэмэлт шүүлт хийх нь илүү найдвартай (Олон Review бичигдсэн байх магадлалтай үед)
            ready_ids = []
            for proposal in base_queryset:
                total_reviewers = proposal.reviewers.count()
                if total_reviewers == 0:
                    continue

                # Томилогдсон шүүмжлэгч бүрийн хамгийн сүүлийн шүүмж completed эсэхийг шалгах
                completed_count = 0
                for reviewer in proposal.reviewers.all():
                    # Тухайн шүүмжлэгчийн тус төсөлд өгсөн хамгийн сүүлийн шүүмж
                    latest_review = (
                        proposal.reviews.filter(reviewer=reviewer)
                        .order_by("-updated_at")
                        .first()
                    )
                    if latest_review and latest_review.is_completed:
                        completed_count += 1

                if total_reviewers == completed_count:
                    ready_ids.append(proposal.id)

            base_queryset = Proposal.objects.filter(id__in=ready_ids).order_by(
                "-updated_at"
            )

        return base_queryset

    # ... бусад perform_create, assign_reviewer, remove_reviewer, submit_proposal функцууд хэвээрээ үлдэнэ ...
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

        if proposal.status == "REVISION_REQUIRED":
            # 1. Засварлаад буцааж байгаа бол шууд ХЯНАГДАЖ БАЙГАА (UNDER_REVIEW) руу шилжинэ
            proposal.status = "UNDER_REVIEW"
            message = (
                "Засварласан төсөл амжилттай илгээгдлээ. Шүүмжлэгчид дахин хянах болно."
            )

            # 2. Шүүмжлэгчид дахин хянаж шийдвэр оруулах боломжтой болгож review-үүдийг нээнэ
            from reviews.models import Review

            Review.objects.filter(proposal=proposal).update(is_completed=False)

            # 3. Шүүмжлэгчид рүү дахин хянах шаардлагатай тухай мэдэгдэл илгээх
            for reviewer in proposal.reviewers.all():
                try:
                    Notification.objects.create(
                        recipient=reviewer,
                        title="Төслийн засвар хийгдлээ",
                        message=f"'{proposal.title[:30]}' төсөлд судлаач засвар оруулсан тул дахин хянана уу.",
                    )
                except Exception as e:
                    print("Notification error:", e)

        else:
            # Шинэ төсөл (DRAFT) илгээж байгаа бол SUBMITTED (Нарийн бичиг рүү) очино
            proposal.status = "SUBMITTED"
            message = "Төсөл амжилттай илгээгдлээ. Нарийн бичиг шалгаж эхлэх болно."

        proposal.save()

        return Response(
            {
                "detail": message,
                "status": proposal.status,
            },
            status=status.HTTP_200_OK,
        )


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]
