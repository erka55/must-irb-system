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
            "protocol_file",  # <--- ЭНЭ МӨРИЙГ ШИНЭЭР НЭМЛЭЭ
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

    # 1. ШИНЭЭР НЭМЭХ: Хэлэлцэх төслүүдийн дэлгэрэнгүйг унших талбар
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
            "proposals_detail",  # 2. ЭНД НЭМЖ БИЧИХЭЭ МАРТУУЗАЙ!
            "decisions",
            "created_at",
            "updated_at",
        ]

    # 3. ШИНЭЭР НЭМЭХ: ID-нуудаар нь хөөж төслийн мэдээллийг угсарч буцаах функц
    def get_proposals_detail(self, obj):
        return [
            {
                "id": p.id,
                "application_no": getattr(p, "application_no", str(p.id)),
                "title": p.title,
            }
            for p in obj.proposals.all()
        ]

    # 2. Шинээр үүсгэх үед хадгалах
    def create(self, validated_data):
        # Баталгаажсан (Proposal объект болж хувирсан) төслүүдийг салгаж авах
        proposals = validated_data.pop("proposals", [])
        # Үндсэн хурлаа үүсгэх
        meeting = super().create(validated_data)
        # Төслүүдээ хүчээр холбож хадгалах
        meeting.proposals.set(proposals)
        return meeting

    # 3. Засварлах үед хадгалах
    def update(self, instance, validated_data):
        # Баталгаажсан төслүүдийг салгаж авах
        proposals = validated_data.pop("proposals", None)
        # Үндсэн хурлаа засах
        instance = super().update(instance, validated_data)

        # Хэрэв фронтоос төслүүд илгээгдсэн байвал холбоосыг шинэчлэх
        if proposals is not None:
            instance.proposals.set(proposals)

        return instance
