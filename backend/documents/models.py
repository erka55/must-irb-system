from django.db import models
from proposals.models import Proposal

class Document(models.Model):
    class DocumentType(models.TextChoices):
        PROTOCOL = 'PROTOCOL', 'Судалгааны протокол / Маягт'
        CONSENT_FORM = 'CONSENT_FORM', 'Зөвшөөрлийн хуудас'
        QUESTIONNAIRE = 'QUESTIONNAIRE', 'Асуулга / Тайлбар'
        APPROVAL_LETTER = 'APPROVAL_LETTER', 'Эцсийн батламж / Шийдвэр'
        OTHER = 'OTHER', 'Бусад хавсралт'

    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DocumentType.choices, default=DocumentType.OTHER)
    file = models.FileField(upload_to='proposals_docs/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.proposal.application_no}"
