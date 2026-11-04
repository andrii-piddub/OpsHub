from django.test import TestCase
from .models import User
import json
from .serializers import UserSerializer 


# Create your tests here.
class RegistrationTests(TestCase):
    def test_registration(self):
        responde = self.client.post(data={'username':'Andre','password':'newAndre123!'}, path="/api/v1/auth/register/")
        self.assertEqual(responde.status_code,201)
        self.assertEqual(len(responde.json()),1)
        self.assertEqual(responde.json()['username'],'Andre')
        self.assertNotIn('password',responde.json())

        user=User.objects.get(username='Andre')
        self.assertNotEqual(user.password,'newAndre123!')
        self.assertTrue(user.check_password('newAndre123!'))
    def test_second_registration(self):
        first_responde = self.client.post(data={'username':'Andre','password':'newAndre123!'},path="/api/v1/auth/register/")
        self.assertEqual(first_responde.status_code,201)
        user_one = User.objects.get()
        self.assertEqual(first_responde.json()['username'],user_one.username)
        second_responde = self.client.post(data={'username':'Andre','password':'newAndre123!'},path="/api/v1/auth/register/")
        self.assertEqual(second_responde.status_code,400)
        self.assertEqual(User.objects.count(),1)
    def test_weak_password(self):
        response = self.client.post(data={'username':'Andre','password':'11'},path="/api/v1/auth/register/")
        self.assertEqual(response.status_code,400)
        self.assertEqual(User.objects.count(),0)
        self.assertIn('password',response.json())
    def test_missed_password(self):
        response = self.client.post(data={'username':'Andre'},path="/api/v1/auth/register/")
        serializer=UserSerializer(data={'username':'Andre'})
        # print(serializer)
        serializer.is_valid()
        self.assertEqual(serializer.errors['password'][0].code, 'required')
        self.assertEqual(response.status_code,400)
        self.assertEqual(User.objects.count(),0)
        self.assertIn('password',response.json())





