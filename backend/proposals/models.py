# backend/proposals/models.py
from django.db import models
from django.conf import settings

class Proposal(models.Model):
    class ReviewLevel(models.TextChoices):
        EXEMPTED = 'EXEMPTED', 'Чөлөөлөгдөх (Маш бага эрсдэлтэй)'
        EXPEDITED = 'EXPEDITED', 'Хялбаршуулсан (Бага эрсдэлтэй)'
        FULL_BOARD = 'FULL_BOARD', 'Бүрэн хэлэлцүүлэг (Өндөр эрсдэлтэй)'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Ноорог'
        SUBMITTED = 'SUBMITTED', 'Илгээсэн (Хянагдаж байгаа)'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Шүүмжлэгчдэд хуваарилсан'
        APPROVED = 'APPROVED', 'Батлагдсан / Зөвшөөрөгдсөн'
        REJECTED = 'REJECTED', 'Татгалзсан'
        REVISION_REQUIRED = 'REVISION_REQUIRED', 'Засвар шаардлагатай'

    application_no = models.CharField(max_length=30, unique=True, verbose_name='Хүсэлтийн дугаар')
    title = models.CharField(max_length=255, verbose_name='Судалгааны сэдэв')
    summary = models.TextField(verbose_name='Товч хураангуй')
    methodology = models.TextField(verbose_name='Арга зүй')
    
    researcher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='proposals',
        verbose_name='Судлаач'
    )
    review_level = models.CharField(
        max_length=20,
        choices=ReviewLevel.choices,
        default=ReviewLevel.EXEMPTED,
        verbose_name='Эрсдэлийн түвшин'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Төлөв'
    )
    reviewers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assigned_proposals',
        blank=True,
        verbose_name='Томилогдсон шүүмжлэгчид'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Үүсгэсэн огноо')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Шинэчилсэн огноо')

    def __str__(self):
        return f"{self.application_no} - {self.title}"
