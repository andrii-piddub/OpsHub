from .serializers import UserSerializer, AcumaticaEmployeeDataSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
import os
import requests
import math


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_me(request):
    return Response({'id':request.user.id,'username':request.user.username,'acumatica_employee_id':request.user.acumatica_employee_id, 'acumatica_employee_name':request.user.acumatica_employee_name},status=status.HTTP_200_OK)

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

@api_view(["PATCH"])
@csrf_protect
@permission_classes([IsAuthenticated])
def update_acumatica_employee_data(request):
    serializer = AcumaticaEmployeeDataSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)





@api_view(["GET"])
@permission_classes([AllowAny])
def FRED(request):
    index_name = request.query_params.get('name')
    FRED_API_KEY = os.environ["FRED_API_KEY"]
    url = f"https://api.stlouisfed.org/fred/series/observations"
    try:
        response = requests.get(url,params={
        "series_id": index_name,
        "api_key": os.environ["FRED_API_KEY"],
        "file_type": "json",
        "sort_order": "desc",
        "limit": 5, 
        }, timeout=50)
        response.raise_for_status()
    except requests.exceptions.HTTPError as exc:
        answer = exc.response.json()
        error_message = answer.get('error_message')
        return Response({'error_message':f'{error_message or 'Wrong answer from outside server'}'},status=status.HTTP_502_BAD_GATEWAY)
    except requests.exceptions.Timeout as exc:
        return Response({'error_message':f'Outside server do not answer'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except requests.exceptions.ConnectionError as exc:
        return Response({'error_message':f'Can not connect to outside server '}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    try:
        data = response.json() 
        observation = data.get("observations")
    except requests.exceptions.JSONDecodeError as exc:
        return response({'error_message':'Outside server send incorrect json'}, status=status.HTTP_502_BAD_GATEWAY)
    if not observation:
        return Response({'error_message':'There is no observation in response'}, status=status.HTTP_502_BAD_GATEWAY)
    try:
        value = observation[0].get("value")
    except (AttributeError, KeyError, TypeError) as exc:
        return Response({'error_message':'Wrong structure of Response'}, status=status.HTTP_502_BAD_GATEWAY)
    if value is None or value=='':
        return Response({'error_message':'Observation in response exist, but value of index is missed'}, status=status.HTTP_502_BAD_GATEWAY)
    try:
        value = float(value)
        if math.isfinite(value) == False:
            return Response({'error_message':'Index value is infinite number'},status=status.HTTP_502_BAD_GATEWAY)
    except (ValueError, TypeError) as exc:
        return Response({'error_message':'Value in response is not number'}, status=status.HTTP_502_BAD_GATEWAY)
    return Response(value, status=status.HTTP_200_OK)          