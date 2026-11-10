from rest_framework import serializers
from .models import Meeting, DecisionLog
from proposals.models import Proposal


class DecisionLogSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return ""

    decision_display = serializers.CharField(
        source="get_decision_display", read_only=True
    )

    proposal_title = serializers.CharField(source="proposal.title", read_only=True)
    proposal_no = serializers.CharField(
        source="proposal.application_no", read_only=True
    )

    class Meta:
        model = DecisionLog
        fields = [
            "id",
            "meeting",
            "proposal",
            "decision",
            "decision_display",
            "meeting_minutes",
            "protocol_file",
            "recorded_by",
            "recorded_by_name",
            "created_at",
            "proposal_title",
            "proposal_no",
        ]
        read_only_fields = ["recorded_by", "created_at"]


class MeetingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    decisions = DecisionLogSerializer(many=True, read_only=True)

    proposals = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Proposal.objects.all(), required=False
    )

    # Хэлэлцэх төслүүдийн дэлгэрэнгүйг унших талбар
    proposals_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "title",
            "meeting_date",
            "location",
            "status",
            "status_display",
            "proposals",
            "proposals_detail",  # ЭНД БАЙГАА
            "decisions",
            "created_at",
            "updated_at",
        ]

    # ШИНЭЧЛЭГДСЭН: Эрх шалгаж, шүүмжүүдийг хавсаргаж буцаах
    def get_proposals_detail(self, obj):
        request = self.context.get("request")
        user = request.user if request else None

        detail_list = []
        for p in obj.proposals.all():
            # 1. ЭРХИЙН ХЯЗГААРЛАЛТ: Судлаач хүн зөвхөн өөрийнхөө төслийг л харна
            if user and getattr(user, "role", None) in ["PI", "RESEARCHER"]:
                if p.researcher != user:
                    continue  # Бусдын төслийг алгасах

            # 2. ШҮҮМЖҮҮДИЙГ АВАХ: Зөвхөн илгээгдсэн (is_completed=True) шүүмжүүдийг хавсаргах
            reviews_data = []
            if hasattr(p, "reviews"):
                for rev in p.reviews.filter(is_completed=True):
                    reviewer_name = (
                        rev.reviewer.get_full_name() or rev.reviewer.username
                        if rev.reviewer
                        else "Тодорхойгүй"
                    )

                    # ЗАССАН ХЭСЭГ: recommendation биш decision гэж дуудна
                    reviews_data.append(
                        {
                            "reviewer_name": reviewer_name,
                            "recommendation_display": (
                                rev.get_decision_display()
                                if hasattr(rev, "get_decision_display")
                                else getattr(rev, "decision", "")
                            ),
                            "comments": getattr(rev, "comments", ""),
                        }
                    )

            detail_list.append(
                {
                    "id": p.id,
                    "application_no": getattr(p, "application_no", str(p.id)),
                    "title": p.title,
                    "researcher_name": (
                        p.researcher.get_full_name() or p.researcher.username
                        if p.researcher
                        else ""
                    ),
                    "reviews": reviews_data,
                }
            )

        return detail_list

    def create(self, validated_data):
        proposals = validated_data.pop("proposals", [])
        meeting = super().create(validated_data)
        meeting.proposals.set(proposals)
        return meeting

    def update(self, instance, validated_data):
        proposals = validated_data.pop("proposals", None)
        instance = super().update(instance, validated_data)

        if proposals is not None:
            instance.proposals.set(proposals)

        return instance

    def validate(self, attrs):
        if self.instance and attrs.get("status") == "COMPLETED":
            total_proposals = self.instance.proposals.count()
            decided_proposals = (
                self.instance.decisions.values("proposal").distinct().count()
            )

            if decided_proposals < total_proposals:
                raise serializers.ValidationError(
                    {
                        "status": f"Нийт {total_proposals} төслөөс {decided_proposals} шийдвэр гарсан байна. Бүх төслийн шийдвэр гарсны дараа хурлыг өндөрлөх боломжтой."
                    }
                )

        return attrs
