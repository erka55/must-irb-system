from rest_framework import viewsets, permissions, exceptions
from django.utils import timezone
from .models import Review
from .serializers import ReviewSerializer
from proposals.models import Proposal

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
            return Review.objects.all().order_by('-assigned_at')

        if user_role == "REVIEWER":
            return Review.objects.filter(reviewer=user).order_by('-assigned_at')

        return Review.objects.filter(proposal__researcher=user).order_by('-assigned_at')

    def perform_create(self, serializer):
        proposal = serializer.validated_data.get('proposal')
        user = self.request.user

        # Давхар хамгаалалт: Зөвхөн тухайн төсөлд томилогдсон шүүмжлэгч л шүүмж хадгалах эрхтэй
        if not proposal.reviewers.filter(id=user.id).exists():
            raise exceptions.PermissionDenied("Та энэ төслийн шүүмжлэгчээр томилогдоогүй байна.")

        serializer.save(
            reviewer=user,
            is_completed=True,
            completed_at=timezone.now()
        )
        # Төлөв автоматаар өөрчилдөг логикийг устгав
        
    def perform_update(self, serializer):
        review = self.get_object()
        user = self.request.user

        # Давхар хамгаалалт: Засвар хийх үед ч томилогдсон эсэхийг шалгана
        if not review.proposal.reviewers.filter(id=user.id).exists():
            raise exceptions.PermissionDenied("Та энэ төслийн шүүмжлэгчээр томилогдоогүй байна.")

        serializer.save(
            is_completed=True, 
            completed_at=timezone.now()
        )
        # Төлөв автоматаар өөрчилдөг логикийг устгав
