from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import WorkItem
from .serializers import WorkItemSerializer, PatchWorkitemSerializer
from rest_framework import status
from rest_framework.views import APIView
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from accounts.models import User



@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "OpsHub API",
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def work_item(request):
    if request.method == "GET":
        query_set = WorkItem.objects.filter(owner=request.user).order_by('-created_at')
        status_item = request.query_params.get('status')
        if status_item not in WorkItem.different_status and status_item is not None:
            return Response({'status':[f'{status_item} is not valid. Choose one from {WorkItem.different_status}']}, status=status.HTTP_400_BAD_REQUEST)
        elif status_item:
            query_set = query_set.filter(status=status_item)
        search = request.query_params.get('search',"").strip()
        if search:
            query_set = query_set.filter(title__icontains=search)
        ordering = request.query_params.get('ordering')
        if ordering=='created_at':
            query_set = query_set.order_by('created_at')
        elif ordering=='-created_at':
            query_set = query_set.order_by('-created_at')
        elif ordering is not None and ordering not in ['created_at','-created_at']:
            return Response({'ordering':f'Wrong ordering atribute - {ordering}'}, status=status.HTTP_400_BAD_REQUEST)
        paginator = Paginator(query_set,10)
        page_number = request.query_params.get('page',1)
        try:
            page=paginator.page(page_number)
        except (PageNotAnInteger):
            return Response ({'Pagination':f'Wrong page - {page_number}'}, status=status.HTTP_400_BAD_REQUEST)
        except EmptyPage:
            return Response({'Empty page':f'There is no page with number {page_number}'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkItemSerializer(page, many=True)
        return Response({
            'results':serializer.data,
            'count':paginator.count,
            'num_pages':paginator.num_pages,
            'current_page':page.number,
            'next': page.next_page_number() if page.has_next() else None,
            'previous': page.previous_page_number() if page.has_previous() else None
        }, status=status.HTTP_200_OK)

    serializer = WorkItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


class ItemPartialUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = WorkItem.objects.filter(owner=request.user).get(id=item_id) 
        except WorkItem.DoesNotExist:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = PatchWorkitemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            updated_item = serializer.save()
            serializer_full = WorkItemSerializer(updated_item)
            return Response(serializer_full.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        try:
            item = WorkItem.objects.filter(owner=request.user).get(id=item_id) 
        except WorkItem.DoesNotExist:
            return Response(
                {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND
            )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
