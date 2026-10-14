from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
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
  
  
@api_view(["GET","POST"])
@permission_classes([AllowAny])
def work_item(request):
  if request.method == 'GET':
    work_item_list = WorkItem.objects.all()
    serializer = WorkItemSerializer(work_item_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
  elif request.method == 'POST':
    serializer = WorkItemSerializer(data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    