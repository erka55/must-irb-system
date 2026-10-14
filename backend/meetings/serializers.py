from rest_framework import serializers
from .models import Meeting, DecisionLog


class DecisionLogSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return ""

    decision_display = serializers.CharField(source='get_decision_display', read_only=True)

    class Meta:
        model = DecisionLog
        fields = [
            'id', 'meeting', 'proposal', 'decision', 
            'decision_display', 'meeting_minutes', 
            'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['recorded_by', 'created_at']


class MeetingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    decisions = DecisionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'meeting_date', 'location', 
            'status', 'status_display', 'proposals', 
            'decisions', 'created_at', 'updated_at'
        ]
