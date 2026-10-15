from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # 'full_name'-ийн оронд 'first_name', 'last_name'-ийг орууллаа
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
    )

    # Хэрэглэгч засах цонхонд харагдах талбарууд
    fieldsets = UserAdmin.fieldsets + (
        ("IRB Системийн Тохиргоо", {"fields": ("role", "phone_number", "department")}),
    )

    # Шинэ хэрэглэгч үүсгэх цонхны талбарууд
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("IRB Системийн Тохиргоо", {"fields": ("role", "phone_number", "department")}),
    )
