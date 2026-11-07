from rest_framework import serializers
from .models import Proposal
from documents.serializers import DocumentSerializer
from reviews.serializers import ReviewSerializer
from meetings.serializers import DecisionLogSerializer


class ProposalSerializer(serializers.ModelSerializer):
    researcher_name = serializers.SerializerMethodField()
    reviewers = serializers.SerializerMethodField()
    review_progress = serializers.SerializerMethodField()  # <--- Шинээр нэмэв

    def get_researcher_name(self, obj):
        if obj.researcher:
            return obj.researcher.get_full_name() or obj.researcher.username
        return ""

    def get_reviewers(self, obj):
        if hasattr(obj, "reviewers"):
            return [
                {
                    "id": rev.id,
                    "username": rev.username,
                    "first_name": rev.first_name,
                    "last_name": rev.last_name,
                    "email": rev.email,
                }
                for rev in obj.reviewers.all()
            ]
        return []

    # <--- Прогресс тооцоолох функцийг Фронтэндтэй тааруулж шинэчлэв --->
    def get_review_progress(self, obj):
        if not hasattr(obj, "reviewers") or not hasattr(obj, "reviews"):
            return None

        reviewers = obj.reviewers.all()
        total = reviewers.count()

        if total == 0:
            return {
                "total_reviewers": 0,
                "completed_count": 0,
                "is_ready": False,
                "details": [],
            }

        # completed_count нь зөвхөн is_completed=True байгаа дүгнэлтүүдийг тоолно
        completed = obj.reviews.filter(is_completed=True).count()

        # Шүүмжлэгч тус бүрийн мэдээллийг жагсаалт болгох
        details = []
        for reviewer in reviewers:
            # Тухайн шүүмжлэгч эцсийн дүгнэлтээ (is_completed=True) оруулсан эсэх
            has_submitted = obj.reviews.filter(
                reviewer=reviewer, is_completed=True
            ).exists()
            name = (
                f"{reviewer.first_name} {reviewer.last_name}".strip()
                or reviewer.username
            )

            details.append({"reviewer_name": name, "has_submitted": has_submitted})

        return {
            "total_reviewers": total,
            "completed_count": completed,
            "is_ready": total > 0 and total == completed,
            "details": details,
        }

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    documents = DocumentSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    final_decisions = DecisionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Proposal
        fields = [
            "id",
            "title",
            "summary",
            "status",
            "status_display",
            "researcher",
            "researcher_name",
            "reviewers",
            "review_progress",
            "created_at",
            "updated_at",
            "documents",
            "reviews",
            "final_decisions",
        ]
        read_only_fields = ["researcher", "created_at", "updated_at"]
