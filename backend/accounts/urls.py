from django.urls import path
from .views import  register, login_app, logout_app, auth_me, auth_csrf


urlpatterns = [
  path("auth/register/",register, name="register"),
  path("auth/login/",login_app, name="login_app"),
  path("auth/logout/",logout_app, name="logout_app"),
  path("auth/me/",auth_me, name="auth_me"),
  path("auth/csrf/",auth_csrf, name="auth_csrf")


]
