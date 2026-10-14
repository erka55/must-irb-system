from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = Document
        fields = ('id', 'proposal', 'document_type', 'document_type_display', 'file', 'uploaded_at')
        read_only_fields = ('uploaded_at',)
