from django.test import TestCase
from .models import User
import json
from .serializers import UserSerializer 
from rest_framework.test import APIClient


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



class LoginTests(TestCase):
    def test_login_success(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response = self.client.post(data={'username':'Andre','password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(self.client.session["_auth_user_id"], str(user.pk))
    def test_wrong_password(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response = self.client.post(data={'username':'Andre','password':'Five23oaks2!'},path="/api/v1/auth/login/")
        self.assertEqual(response.status_code,400)
        self.assertNotIn("_auth_user_id", self.client.session)
    def test_wrong_username(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response = self.client.post(data={'username':'Andrey','password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response.status_code,400)
        self.assertNotIn("_auth_user_id", self.client.session)
    def test_missed_credentials(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response = self.client.post(data={'password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response.status_code,400)
        self.assertNotIn("_auth_user_id", self.client.session)

class LogoutTests(TestCase):
    def test_logout_authorised_user(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response_one = self.client.post(data={'username':'Andre','password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response_one.status_code,200)
        response_two = self.client.post(path="/api/v1/auth/logout/")
        self.assertEqual(response_two.status_code,200)
        self.assertNotIn("_auth_user_id", self.client.session)
    def test_logout_not_authorised_user(self):
        response_two = self.client.post(path="/api/v1/auth/logout/")
        self.assertEqual(response_two.status_code,403)
    def test_logout_then_login(self):
        user = User.objects.create_user(username='Andre',password='Five23oaks!')
        response_one = self.client.post(data={'username':'Andre','password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response_one.status_code,200)
        response_two = self.client.post(path="/api/v1/auth/logout/")
        self.assertEqual(response_two.status_code,200)
        self.assertNotIn("_auth_user_id", self.client.session)
        response_three = self.client.post(data={'username':'Andre','password':'Five23oaks!'},path="/api/v1/auth/login/")
        self.assertEqual(response_three.status_code,200)
        self.assertEqual(self.client.session["_auth_user_id"], str(user.pk))


class CSRFTests(TestCase):
    def test_authorized_me(self):
        response_post=self.client.post(data={'username':'Andre','password':'newAndre123!'}, path="/api/v1/auth/register/")
        self.assertEqual(response_post.status_code,201)
        response_one = self.client.post(data={'username':'Andre','password':'newAndre123!'},path="/api/v1/auth/login/")
        self.assertEqual(response_one.status_code,200)
        response_two = self.client.get(path="/api/v1/auth/me/")
        self.assertEqual(response_two.status_code,200)
        user=User.objects.get(username='Andre')
        self.assertEqual(response_two.json()['username'],user.username)
        self.assertEqual(response_two.json()['id'],user.id)
    def test_anonimus_me(self):
        response_two = self.client.get(path="/api/v1/auth/me/")
        self.assertEqual(response_two.status_code,403)
    def test_authorized_get_csrf(self):
        response_csrf = self.client.get(path="/api/v1/auth/csrf/")
        self.assertEqual(response_csrf.status_code,200)
        self.assertIn('csrftoken',response_csrf.cookies)
        self.assertTrue(response_csrf.cookies['csrftoken'].value)
    def test_login_without_csrf_token(self):
        client = APIClient(enforce_csrf_checks=True)
        user = User.objects.create_user(username='Andre', password='newAndre123!')
        response_one = client.post(data={'username':user.username,'password':'newAndre123!'},path="/api/v1/auth/login/")
        self.assertEqual(response_one.status_code,403)
    def test_login_with_csrf_token(self):
        client = APIClient(enforce_csrf_checks=True)
        user = User.objects.create_user(username='Andre', password='newAndre123!')
        response_csrf = client.get(path="/api/v1/auth/csrf/")
        self.assertEqual(response_csrf.status_code, 200)
        csrf_token = client.cookies['csrftoken']
        response_login=client.post(path="/api/v1/auth/login/", data={"username":"Andre","password":"newAndre123!"},format="json",HTTP_X_CSRFTOKEN=csrf_token.value)
        self.assertEqual(response_login.status_code,200)
        self.assertIn("sessionid",client.cookies)
        self.assertEqual(client.session['_auth_user_id'],str(user.id))

        
