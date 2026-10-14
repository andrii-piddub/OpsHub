from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import WorkItem
from .serializers import WorkItemSerializer
from rest_framework import status



@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
  return Response({
    'status':'ok',
    'service':'OpsHub API',
  })

def WorkItem(request):
  workItem = WorkItem.objects.all().values()
  serializer = WorkItemSerializer(workItem, many=True)
  return Response(serializer.data, status=status.HTTP_200_OK)