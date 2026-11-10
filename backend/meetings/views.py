from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Meeting, DecisionLog
from .serializers import MeetingSerializer, DecisionLogSerializer
from proposals.models import Proposal
from users.models import User
from notifications.models import Notification


class MeetingViewSet(viewsets.ModelViewSet):
    # queryset-ийг энд шууд тодорхойлохын оронд get_queryset() дотор тодорхойлно
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Meeting.objects.all().order_by("-meeting_date")

        # Хэрэв хэрэглэгч role-гүй (эсвэл нэвтрээгүй) бол хоосон буцаана (Алдаа гарахаас сэргийлнэ)
        if getattr(user, "role", None) is None:
            return queryset.none()

        # Дарга, Нарийн бичиг, Шүүмжлэгч эсвэл Админ бол бүх хурлыг харна
        if user.role in ["CHAIR", "SECRETARY", "REVIEWER"] or user.is_staff:
            return queryset

        # Судлаач бол зөвхөн өөрийнх нь төсөл багтсан хурлыг харна
        if user.role in ["PI", "RESEARCHER"]:
            return queryset.filter(proposals__researcher=user).distinct()

        return queryset

    @action(detail=True, methods=["get", "post"])
    def record_decision(self, request, pk=None):
        """
        Хурлаар хэлэлцсэн Proposal-д эцсийн шийдвэр гаргаж, Proposal-ийн төлвийг шинэчлэх
        """
        meeting = self.get_object()

        # GET хүсэлтээр орж ирвэл Browsable API дээр Form харуулна
        if request.method == "GET":
            return Response(
                {
                    "detail": "Хурлын шийдвэр оруулахын тулд доорх маягтаар proposal_id болон decision-ийг POST илгээгээрэй.",
                    "meeting_id": meeting.id,
                    "meeting_title": meeting.title,
                }
            )

        # Зөвхөн Нарийн бичиг, Дарга эсвэл Админ хурлын шийдвэр оруулах эрхтэй
        if (
            request.user.role not in [User.Role.SECRETARY, User.Role.CHAIR]
            and not request.user.is_staff
        ):
            return Response(
                {
                    "detail": "Зөвхөн Нарийн бичиг болон Дарга хурлын шийдвэр оруулах эрхтэй."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        proposal_id = request.data.get("proposal_id")
        decision_val = request.data.get("decision")
        minutes = request.data.get("meeting_minutes", "")

        # 1. Фронтэндээс илгээсэн файлыг хүлээн авах
        protocol_file = request.FILES.get("protocol_file")

        if not proposal_id or not decision_val:
            return Response(
                {"detail": "proposal_id болон decision шаардлагатай."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            proposal = Proposal.objects.get(id=proposal_id)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Заасан Proposal олдсонгүй."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2. ӨӨРЧИЛСӨН ХЭСЭГ: DecisionLog үүсгэх биш, харин байгаа бол шинэчлэх (update_or_create)
        defaults_data = {
            "decision": decision_val,
            "meeting_minutes": minutes,
            "recorded_by": request.user,
        }

        # Хэрэв шинээр файл оруулсан бол түүнийг нь шинэчилнэ, үгүй бол хуучныг нь хэвээр үлдээнэ
        if protocol_file:
            defaults_data["protocol_file"] = protocol_file

        decision_log, created = DecisionLog.objects.update_or_create(
            meeting=meeting, proposal=proposal, defaults=defaults_data
        )

        # 3. УХААЛАГ ТӨЛӨВ ШИНЭЧЛЭХ ХЭСЭГ:
        # Тухайн хуралд хэлэлцэхээр товлосон нийт төслийн тоо
        total_proposals = meeting.proposals.count()
        # Одоогоор шийдвэр нь бүртгэгдсэн төслүүдийн тоо
        decided_proposals = (
            DecisionLog.objects.filter(meeting=meeting)
            .values("proposal")
            .distinct()
            .count()
        )

        if decided_proposals >= total_proposals:
            # Бүх төслийн шийдвэр гарсан бол хурлыг "Өндөрлөсөн" болгох
            if meeting.status != Meeting.Status.COMPLETED:
                meeting.status = Meeting.Status.COMPLETED
                meeting.save()
        else:
            # Шийдвэр дутуу төсөл байвал хурлыг "Явагдаж байна" төлөвт оруулах
            if meeting.status != Meeting.Status.IN_PROGRESS:
                meeting.status = Meeting.Status.IN_PROGRESS
                meeting.save()

        # Хурлаас гарсан эцсийн шийдвэрийг дагаж Proposal-ийн status шинэчлэгдэнэ
        if decision_val == DecisionLog.FinalDecision.APPROVED:
            proposal.status = Proposal.Status.APPROVED
        elif decision_val == DecisionLog.FinalDecision.REJECTED:
            proposal.status = Proposal.Status.REJECTED
        elif decision_val == DecisionLog.FinalDecision.REVISION_REQUIRED:
            proposal.status = Proposal.Status.REVISION_REQUIRED

        proposal.save()

        Notification.objects.create(
            recipient=proposal.researcher,
            title="Хурлын шийдвэр гарлаа",
            message=f"Таны '{proposal.title}' судалгааны хүсэлт хурлаар орж, дараах шийдвэр гарлаа: {proposal.get_status_display()}.",
        )

        return Response(
            DecisionLogSerializer(decision_log).data, status=status.HTTP_201_CREATED
        )

    def perform_destroy(self, instance):
        """1. Хурал устгах үед холбогдсон төслүүдийг буцааж чөлөөлөх"""
        for proposal in instance.proposals.all():
            # Шийдвэр гаргаж баталгаажаагүй төслүүдийг буцаагаад UNDER_REVIEW төлөвт оруулна
            if proposal.status not in [
                Proposal.Status.APPROVED,
                Proposal.Status.REJECTED,
                Proposal.Status.REVISION_REQUIRED,
            ]:
                proposal.status = Proposal.Status.UNDER_REVIEW
                proposal.save()

        # Үүний дараа хурлыг баазаас устгана
        instance.delete()

    def perform_update(self, serializer):
        """2. Хурлын төлөв өөрчлөх (Цуцлах) үед төслүүдийг чөлөөлөх"""
        instance = serializer.save()

        # Хэрэв хурлыг "CANCELLED" (Цуцлагдсан) болгож байвал
        if instance.status == Meeting.Status.CANCELLED:
            for proposal in instance.proposals.all():
                if proposal.status not in [
                    Proposal.Status.APPROVED,
                    Proposal.Status.REJECTED,
                    Proposal.Status.REVISION_REQUIRED,
                ]:
                    proposal.status = Proposal.Status.UNDER_REVIEW
                    proposal.save()

            # Цуцлагдсан хурлаас төслүүдийг салгах (Дараагийн шинэ хуралд сонгогдох боломжтой болгоно)
            instance.proposals.clear()


class DecisionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DecisionLog.objects.all().order_by("-created_at")
    serializer_class = DecisionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
