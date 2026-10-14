from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    def get_reviewer_name(self, obj):
        if obj.reviewer:
            return obj.reviewer.get_full_name() or obj.reviewer.username
        return ""

    decision_display = serializers.CharField(source='get_decision_display', read_only=True)

    class Meta:
        model = Review
        fields = (
            'id', 
            'proposal', 
            'reviewer', 
            'reviewer_name', 
            'decision', 
            'decision_display', 
            'comments', 
            'is_completed',
            'assigned_at',
            'completed_at'
        )
        read_only_fields = ('reviewer', 'assigned_at', 'completed_at')
