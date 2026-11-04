from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['username','password']
    extra_kwargs ={'password':{'write_only':True}}
    
  def validate(self, attrs):
    user = User(username=attrs.get('username'))
    try:
      validate_password(attrs.get('password'), user=user)
    except ValidationError as e:
      raise serializers.ValidationError({'password': e.messages})
    return attrs
  def create(self,validated_data):
    return User.objects.create_user(**validated_data)