from rest_framework import serializers
from .models import WorkItem


class WorkItemSerializer(serializers.Serializer):
  class Meta:
    model = WorkItem
    fields = '__all__'