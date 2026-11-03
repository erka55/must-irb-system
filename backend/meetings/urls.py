from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet, DecisionLogViewSet

router = DefaultRouter()
router.register(r"meetings", MeetingViewSet, basename="meeting")
router.register(r"decision-logs", DecisionLogViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
