# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        RESEARCHER = 'RESEARCHER', 'Судлаач / Багш, Оюутан'
        SECRETARY = 'SECRETARY', 'Ёс зүйн хорооны Нарийн бичиг'
        REVIEWER = 'REVIEWER', 'Шүүмжлэгч / Гишүүн'
        CHAIR = 'CHAIR', 'Ёс зүйн хорооны Дарга'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.RESEARCHER,
        verbose_name='Хэрэглэгчийн үүрэг'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name='Утасны дугаар')
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name='Сургууль / Сэжим / Салбар')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username