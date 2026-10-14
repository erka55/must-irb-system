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
    queryset = Meeting.objects.all().order_by('-meeting_date')
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get', 'post'])
    def record_decision(self, request, pk=None):
        """
        Хурлаар хэлэлцсэн Proposal-д эцсийн шийдвэр гаргаж, Proposal-ийн төлвийг шинэчлэх
        """
        meeting = self.get_object()

        # GET хүсэлтээр орж ирвэл Browsable API дээр Form харуулна
        if request.method == 'GET':
            return Response({
                "detail": "Хурлын шийдвэр оруулахын тулд доорх маягтаар proposal_id болон decision-ийг POST илгээгээрэй.",
                "meeting_id": meeting.id,
                "meeting_title": meeting.title
            })

        # Зөвхөн Нарийн бичиг, Дарга эсвэл Админ хурлын шийдвэр оруулах эрхтэй
        if request.user.role not in [User.Role.SECRETARY, User.Role.CHAIR] and not request.user.is_staff:
            return Response(
                {"detail": "Зөвхөн Нарийн бичиг болон Дарга хурлын шийдвэр оруулах эрхтэй."},
                status=status.HTTP_403_FORBIDDEN
            )

        proposal_id = request.data.get('proposal_id')
        decision_val = request.data.get('decision')
        minutes = request.data.get('meeting_minutes', '')

        if not proposal_id or not decision_val:
            return Response(
                {"detail": "proposal_id болон decision шаардлагатай."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            proposal = Proposal.objects.get(id=proposal_id)
        except Proposal.DoesNotExist:
            return Response({"detail": "Заасан Proposal олдсонгүй."}, status=status.HTTP_404_NOT_FOUND)

        # DecisionLog үүсгэх
        decision_log = DecisionLog.objects.create(
            meeting=meeting,
            proposal=proposal,
            decision=decision_val,
            meeting_minutes=minutes,
            recorded_by=request.user
        )

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
            message=f"Таны '{proposal.title}' судалгааны хүсэлт хурлаар орж, дараах шийдвэр гарлаа: {proposal.get_status_display()}."
        )

        return Response(
            DecisionLogSerializer(decision_log).data,
            status=status.HTTP_201_CREATED
        )

class DecisionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DecisionLog.objects.all().order_by('-created_at')
    serializer_class = DecisionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
