from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_me(request):
    return Response({'id':request.user.id,'username':request.user.username},status=status.HTTP_200_OK)

@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def auth_csrf(request):
    return Response(status=status.HTTP_200_OK)

@api_view(["POST"])
@csrf_protect
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


@api_view(["POST"])
@csrf_protect
@permission_classes([AllowAny])
def login_app(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"detail": "Insert username and password."},
        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response( status=status.HTTP_200_OK)
    else:
        return Response({'details':'Wrong password or username'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_app(request):
    logout(request)
    return Response(status=status.HTTP_200_OK)