from django.urls import path
from .views import  register, login_app


urlpatterns = [
  path("auth/register/",register, name="register"),
  path("auth/login/",login_app, name="login_app"),

]
