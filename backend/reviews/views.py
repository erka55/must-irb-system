from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import Review
from .serializers import ReviewSerializer
from proposals.models import Proposal

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [user.Role.SECRETARY, user.Role.CHAIR, user.Role.REVIEWER] or user.is_staff:
            return Review.objects.all().order_by('-assigned_at')
        return Review.objects.filter(proposal__researcher=user).order_by('-assigned_at')

    def perform_create(self, serializer):
        review = serializer.save(
            reviewer=self.request.user, 
            is_completed=True, 
            completed_at=timezone.now()
        )
        
        # Proposal-ийн төлвийг Шүүмжийн шийдвэрээс хамааруулан шинэчлэх
        proposal = review.proposal
        decision_val = str(review.decision).upper()

        if 'APPROV' in decision_val or 'ACCEPT' in decision_val:
            proposal.status = Proposal.Status.APPROVED
        elif 'REJECT' in decision_val:
            proposal.status = Proposal.Status.REJECTED
        elif 'REVISION' in decision_val or 'MODIFY' in decision_val:
            proposal.status = Proposal.Status.REVISION_REQUIRED
        else:
            proposal.status = Proposal.Status.UNDER_REVIEW
            
        proposal.save()