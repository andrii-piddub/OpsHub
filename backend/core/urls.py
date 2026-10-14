from django.urls import path
from .views import health_check, work_item


urlpatterns = [
  path("health/",health_check, name="health_check"),
  path('workitem/',work_item, name='work_item')
]