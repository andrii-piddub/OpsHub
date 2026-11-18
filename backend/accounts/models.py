from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    acumatica_employee_id=models.CharField(max_length=100, blank=True)
    acumatica_employee_name = models.CharField(max_length=100, blank=True)

