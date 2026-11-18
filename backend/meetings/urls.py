from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet, DecisionLogViewSet, DecisionLetterViewSet

router = DefaultRouter()
router.register(r"meetings", MeetingViewSet, basename="meeting")
router.register(r"decision-logs", DecisionLogViewSet)
router.register(r'decision-letters', DecisionLetterViewSet, basename='decision-letter')

urlpatterns = [
    path("", include(router.urls)),
]
