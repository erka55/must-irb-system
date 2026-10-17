from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer


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
            return Review.objects.all()

        if user_role == "REVIEWER":
            return Review.objects.filter(reviewer=user)

        return Review.objects.filter(proposal__researcher=user)

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
