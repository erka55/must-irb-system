from django.db import models
from django.conf import settings
from django.core.mail import send_mail

class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="Хүлээн авагч"
    )
    title = models.CharField(max_length=255, verbose_name="Гарчиг")
    message = models.TextField(verbose_name="Мэдэгдлийн агуулга")
    is_read = models.BooleanField(default=False, verbose_name="Уншсан эсэх")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Шинээр мэдэгдэл үүсэж байгаа бол хэрэглэгчийн и-мэйл рүү давхар илгээнэ
        if is_new and self.recipient.email:
            # 1. ТЕРМИНАЛ ДЭЭР ЦЭВЭРХЭН КИРИЛЛЭЭР ХАРУУЛАХ
            print(f"\n================ [EMAIL NOTIFICATION] ================")
            print(f"To: {self.recipient.email}")
            print(f"Subject: [MUST IRB] {self.title}")
            print(f"Message:\n{self.message}")
            print(f"======================================================\n")

            # 2. И-мэйл илгээх хэсэг
            try:
                send_mail(
                    subject=f"[MUST IRB] {self.title}",
                    message=self.message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[self.recipient.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Имэйл илгээхэд алдаа гарлаа: {e}")
