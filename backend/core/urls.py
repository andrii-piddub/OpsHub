from django.urls import path
from .views import ItemPartialUpdateView, health_check, work_item


urlpatterns = [
  path("health/",health_check, name="health_check"),
  path('workitem/',work_item, name='work_item'),
  path('workitem/<int:item_id>/', ItemPartialUpdateView.as_view(), name='work_item_partial_update'),
]
