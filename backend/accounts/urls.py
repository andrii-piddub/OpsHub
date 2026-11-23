from django.urls import path
from .views import  register, login_app, logout_app, auth_me, auth_csrf, update_acumatica_employee_data, FRED


urlpatterns = [
  path("auth/register/",register, name="register"),
  path("auth/login/",login_app, name="login_app"),
  path("auth/logout/",logout_app, name="logout_app"),
  path("auth/me/",auth_me, name="auth_me"),
  path("auth/me/acumatica/",update_acumatica_employee_data, name="update_acumatica_employee_data"),
  path("auth/csrf/",auth_csrf, name="auth_csrf"),
  path("market/indexes/",FRED, name="auth_csrf"),




]
