from rest_framework import serializers
from .models import Proposal
from documents.serializers import DocumentSerializer
from reviews.serializers import ReviewSerializer
from meetings.serializers import DecisionLogSerializer


class ProposalSerializer(serializers.ModelSerializer):
    researcher_name = serializers.SerializerMethodField()

    def get_researcher_name(self, obj):
        if obj.researcher:
            return obj.researcher.get_full_name() or obj.researcher.username
        return ""

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Nested Serializers (Холбогдох модулиудын дэлгэрэнгүй мэдээлэл)
    documents = DocumentSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    final_decisions = DecisionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'title', 'summary', 'status', 'status_display',
            'researcher', 'researcher_name', 'created_at', 'updated_at',
            'documents', 'reviews', 'final_decisions'
        ]
        read_only_fields = ['researcher', 'created_at', 'updated_at']
