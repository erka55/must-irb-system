from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Proposal
from .serializers import ProposalSerializer
from reviews.models import Review

from django.db.models import Count
from users.models import User
from meetings.models import Meeting
from notifications.models import Notification

class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all().order_by('-created_at')
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Нарийн бичиг, Дарга, Шүүмжлэгч болон Админ нь бүх хүсэлтийг харна
        if user.role in [User.Role.SECRETARY, User.Role.CHAIR, User.Role.REVIEWER] or user.is_staff:
            return Proposal.objects.all().order_by('-created_at')
        # Судлаач зөвхөн өөрийн үүсгэсэн хүсэлтүүдийг харна
        return Proposal.objects.filter(researcher=user).order_by('-created_at')

    def perform_create(self, serializer):
        # Хүсэлт үүсгэхэд нэвтэрсэн хэрэглэгчийг судлаачаар тохируулна
        serializer.save(researcher=self.request.user)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def assign_reviewer(self, request, pk=None):
        proposal = self.get_object()

        if request.method == 'GET':
            return Response({
                "detail": "Шүүмжлэгч хуваарилахын тулд доорх маягтаар reviewer_id-г POST илгээнэ үү.",
                "proposal_id": proposal.id,
                "proposal_title": proposal.title
            })
        
        # Зөвхөн Нарийн бичиг, Дарга эсвэл Админ томилох эрхтэй
        if request.user.role not in [User.Role.SECRETARY, User.Role.CHAIR] and not request.user.is_staff:
            return Response(
                {"detail": "Зөвхөн Нарийн бичиг болон Дарга шүүмжлэгч хуваарилах эрхтэй."},
                status=status.HTTP_403_FORBIDDEN
            )

        reviewer_id = request.data.get('reviewer_id')
        if not reviewer_id:
            return Response({"detail": "reviewer_id шаардлагатай."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reviewer = User.objects.get(id=reviewer_id, role=User.Role.REVIEWER)
        except User.DoesNotExist:
            return Response({"detail": "Заасан ID-тай шүүмжлэгч олдсонгүй."}, status=status.HTTP_400_BAD_REQUEST)

        # get_or_create-ийн оронд давхардлаас сэргийлсэн аюулгүй логик:
        review = Review.objects.filter(proposal=proposal, reviewer=reviewer).first()
        if not review:
            review = Review.objects.create(
                proposal=proposal,
                reviewer=reviewer,
                is_completed=False
            )

        # Proposal-ийн төлвийг UNDER_REVIEW болгох
        proposal.status = Proposal.Status.UNDER_REVIEW
        proposal.save()

        # 1. Шүүмжлэгчид мэдэгдэл илгээх
        Notification.objects.create(
            recipient=reviewer,
            title="Шинэ шүүмжлэх хүсэлт хуваарилагдлаа",
            message=f"Та '{proposal.title}' судалгааны хүсэлтэд шүүмжлэгчээр томилогдлоо."
        )

        # 2. Судлаачид мэдэгдэл илгээх
        Notification.objects.create(
            recipient=proposal.researcher,
            title="Судалгааны хүсэлтийн төлөв өөрчлөгдлөө",
            message=f"Таны '{proposal.title}' хүсэлтэд шүүмжлэгч томилогдож, хянагдаж эхэллээ."
        )

        return Response({
            "detail": f"Шүүмжлэгч {reviewer.get_full_name() or reviewer.username} амжилттай хуваарилагдлаа.",
            "review_id": review.id,
            "proposal_status": proposal.status
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        """
        Дашбордод зориулсан нэгдсэн статистик мэдээлэл буцаах API
        """
        # 1. Proposal-ийн статусын тоололт
        proposal_stats = Proposal.objects.values('status').annotate(count=Count('id'))
        status_counts = {item['status']: item['count'] for item in proposal_stats}

        # 2. Хурлын статусын тоололт
        meeting_stats = Meeting.objects.values('status').annotate(count=Count('id'))
        meeting_counts = {item['status']: item['count'] for item in meeting_stats}

        # 3. Хэрэглэгчдийн ролын тоололт
        user_stats = User.objects.values('role').annotate(count=Count('id'))
        user_counts = {item['role']: item['count'] for item in user_stats}

        return Response({
            "proposals": {
                "total": Proposal.objects.count(),
                "by_status": status_counts
            },
            "meetings": {
                "total": Meeting.objects.count(),
                "by_status": meeting_counts
            },
            "users": {
                "total": User.objects.count(),
                "by_role": user_counts
            }
        })
