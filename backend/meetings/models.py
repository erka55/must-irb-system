from django.db import models
from django.conf import settings
from proposals.models import Proposal

class Meeting(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Товлогдсон'
        IN_PROGRESS = 'IN_PROGRESS', 'Явагдаж байгаа'
        COMPLETED = 'COMPLETED', 'Өндөрлөсөн'
        CANCELLED = 'CANCELLED', 'Цуцлагдсан'

    title = models.CharField(max_length=255, verbose_name="Хурлын нэр")
    meeting_date = models.DateTimeField(verbose_name="Хуралдах огноо, цаг")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Байршил / Онлайн холбоос")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED, verbose_name="Төлөв")
    
    # Хурлаар хэлэлцэх Proposal-ууд
    proposals = models.ManyToManyField(Proposal, related_name='meetings', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.meeting_date.strftime('%Y-%m-%d %H:%M')})"


class DecisionLog(models.Model):
    class FinalDecision(models.TextChoices):
        APPROVED = 'APPROVED', 'Нэгдсэн бичгээр баталсан'
        REJECTED = 'REJECTED', 'Татгалзсан'
        REVISION_REQUIRED = 'REVISION_REQUIRED', 'Засвар хийлгэхээр буцаасан'

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='decisions')
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='final_decisions')
    decision = models.CharField(max_length=20, choices=FinalDecision.choices, verbose_name="Эцсийн шийдвэр")
    meeting_minutes = models.TextField(blank=True, null=True, verbose_name="Хурлын тэмдэглэл / Протокол")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Тэмдэглэл хөтөлсөн")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.proposal.title} - {self.get_decision_display()}"
