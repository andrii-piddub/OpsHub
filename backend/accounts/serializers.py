from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['username','password']
    extra_kwargs ={'password':{'write_only':True}}
    
  def validate_password(self,value):
    try:
      validate_password(value)
    except ValidationError as e:
      raise serializers.ValidationError(e.messages)
    return value
  def create(self,validated_data):
    return User.objects.create_user(**validated_data)