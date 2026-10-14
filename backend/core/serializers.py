from rest_framework import serializers
from .models import WorkItem


class WorkItemSerializer(serializers.ModelSerializer):
  class Meta:
    model = WorkItem
    fields = ['id', 'title', 'description', 'status', 'created_at']