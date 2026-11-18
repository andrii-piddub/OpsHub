from django.urls import path
from .views import  acumatica_connect, acumatica_callback, acumatica_cases,acumatica_employee


urlpatterns = [
    path("acumatica/connect/",acumatica_connect, name="connect"),
    path("acumatica/callback/",acumatica_callback, name="acumatica_callback"),
    path("acumatica/cases/", acumatica_cases, name="acumatica_cases"),
    path("acumatica/employee/", acumatica_employee, name="acumatica_employee"),

]
