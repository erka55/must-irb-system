from rest_framework import viewsets, permissions, exceptions
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Review
from .serializers import ReviewSerializer
from proposals.models import Proposal
from notifications.models import Notification

User = get_user_model()

def create_review_notification(review, request_user):
    """Шүүмжлэгч дүгнэлт оруулах үед Дарга, Нарийн бичигт мэдэгдэх туслах функц"""
    proposal = review.proposal
    reviewer_name = request_user.get_full_name() or request_user.username
    
    # Дарга болон Нарийн бичгийн эрхтэй хэрэглэгчдийг олох
    recipients = User.objects.filter(role__in=["CHAIR", "SECRETARY", "SECRETARY_CHAIR"])
    
    for recipient in recipients:
        Notification.objects.create(
            recipient=recipient,
            title="Шүүмжийн дүгнэлт орлоо",
            message=f"Шүүмжлэгч {reviewer_name} '{proposal.title}' төсөл дээр дүгнэлт орууллаа."
        )


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or user.is_anonymous:
            return Review.objects.none()

        user_role = str(getattr(user, "role", "")).upper()

        if user.is_staff or user_role in ["SECRETARY", "CHAIR", "SECRETARY_CHAIR"]:
            return Review.objects.all().order_by("-assigned_at")

        if user_role == "REVIEWER":
            return Review.objects.filter(reviewer=user).order_by("-assigned_at")

        return Review.objects.filter(proposal__researcher=user).order_by("-assigned_at")

    def perform_create(self, serializer):
        proposal = serializer.validated_data.get("proposal")
        user = self.request.user

        # Давхар хамгаалалт
        if not proposal.reviewers.filter(id=user.id).exists():
            raise exceptions.PermissionDenied(
                "Та энэ төслийн шүүмжлэгчээр томилогдоогүй байна."
            )

        review = serializer.save(reviewer=user, is_completed=True, completed_at=timezone.now())
        create_review_notification(review, user)

    def perform_update(self, serializer):
        review = self.get_object()
        user = self.request.user

        # Давхар хамгаалалт
        if not review.proposal.reviewers.filter(id=user.id).exists():
            raise exceptions.PermissionDenied(
                "Та энэ төслийн шүүмжлэгчээр томилогдоогүй байна."
            )

        updated_review = serializer.save(is_completed=True, completed_at=timezone.now())
        create_review_notification(updated_review, user)
