# backend/reviews/models.py
from django.db import models
from django.conf import settings
from proposals.models import Proposal

class Review(models.Model):
    class Decision(models.TextChoices):
        ACCEPT = 'ACCEPT', 'Зөвшөөрөх'
        MINOR_REVISION = 'MINOR_REVISION', 'Бага хэмжээний засвар хийлгэх'
        MAJOR_REVISION = 'MAJOR_REVISION', 'Их хэмжээний засвар хийлгэх'
        REJECT = 'REJECT', 'Татгалзах'

    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_reviews')
    comments = models.TextField(blank=True, null=True, verbose_name='Шүүмжийн сэтгэгдэл / Санал')
    decision = models.CharField(max_length=20, choices=Decision.choices, blank=True, null=True)
    is_completed = models.BooleanField(default=False, verbose_name='Үнэлгээ дууссан эсэх')
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Review for {self.proposal.application_no} by {self.reviewer.username}"
