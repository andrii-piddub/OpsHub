from django.test import TestCase
from .models import WorkItem
import json
from datetime import timedelta
from django.utils import timezone
from accounts.models import User

# Create your tests here.
class WorkItemDeleteTests(TestCase): 
    def setUp(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
    def test_delete_existing_work_item(self):
        new_Item = self.client.post(data={"title":"new2","description":"new description"}, path='/api/v1/workitem/')
        response = self.client.delete(path=f"/api/v1/workitem/{new_Item.json()['id']}/")
        self.assertEqual(response.status_code,204)
        self.assertFalse(WorkItem.objects.filter(id=new_Item.json()['id']).exists())
    def test_delete_nonexistent_work_item(self):
        response = self.client.delete(path="/api/v1/workitem/9999999/")
        self.assertEqual(response.status_code,404)

class WorkItemCreateTests(TestCase):
    def setUp(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
    def test_create_work_item(self):
        response = self.client.post(data={"title":"Test item","description":"Test description"}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        self.assertEqual(WorkItem.objects.count(),1)
        created_Item = WorkItem.objects.get()
        self.assertEqual(created_Item.title,"Test item")
        self.assertEqual(created_Item.description,"Test description")
    def test_create_work_item_without_title(self):
        response = self.client.post(data={"description":"Test description"}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,400)
        self.assertEqual(WorkItem.objects.count(),0)
    def test_create_work_item_wrong_status(self):
        response = self.client.post(data={'title':'Third title', 'status':'XX'},path='/api/v1/workitem/')
        self.assertEqual(response.status_code,400)
        response_get=self.client.get("/api/v1/workitem/")
        self.assertEqual(len(response_get.json()['results']),0)
    def test_create_work_item_only_with_title(self):
        response = self.client.post(data={'title':'Interesting info'}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        response_get=WorkItem.objects.get()
        self.assertEqual(response_get.description,'')
    def test_create_work_item_without_status(self):
        response = self.client.post(data={'title':'Fourth  title'},path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        response_get=WorkItem.objects.get()
        self.assertEqual(response_get.status,'OP')
    def test_create_work_item_with_empty_title(self):
        response = self.client.post(data={'title':''},path='/api/v1/workitem/')
        self.assertEqual(response.status_code,400)
        error_message = response.json()
        self.assertEqual(error_message['title'],['This field may not be blank.'])
        self.assertEqual(WorkItem.objects.count(),0)
    def test_create_long_title(self):
        response = self.client.post(data={'title':'?]x.!?22A=dVy?M7QwYxFLa@06e2+*{2==,K@_qD}ngPtCm;YL@r=]BG6rhztJx0qk?#%XCdH,Xx=@{+!c?wP?,:yj:gR1vDzw:!ETDp*faS7)AG+Fq!!)J),71;L/*idBwDvZbD]Hp-{z&}aA66=;/pda)*%2p%b2D[?#PJ$0SU-]NnZiLF}6$qvw.6jjg+j3/,%h1+k'},
        path='/api/v1/workitem/')
        self.assertEqual(response.status_code,400)
        self.assertEqual(WorkItem.objects.count(),0)
    def test_create_workitem_without_priority(self):
        response = self.client.post(data={'title':'New Case','description':'New description','status':'OP'}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.json()['priority'],'ME')
    def test_create_workitem_with_priority_HI(self):
        response = self.client.post(data={'title':'New Case','description':'New description','status':'OP','priority':'HI'}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.json()['priority'],'HI')
    def test_create_workitem_with_priority_XX(self):
        response = self.client.post(data={'title':'New Case','description':'New description','status':'OP','priority':'XX'}, path='/api/v1/workitem/')
        self.assertEqual(response.status_code,400)


class WorkItemUpdateTests(TestCase):
    def setUp(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
    def test_update_work_item(self):
        response = self.client.post(data={'title':'Test item','description':'New description','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        created_item = WorkItem.objects.get(title='Test item')
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.id}/",data=json.dumps({'status':'DN'}), content_type="application/json")
        self.assertEqual(patch_response.status_code,200)
        created_item.refresh_from_db()
        self.assertEqual(created_item.status,"DN")
    def test_update_work_item_non_existed_id(self):
        patch_response = self.client.patch(path="/api/v1/workitem/99999/",data=json.dumps({'status':'DN'}), content_type="application/json")
        self.assertEqual(patch_response.status_code,404)
    def test_update_work_item_existed_id_wrong_status(self):
        response = self.client.post(data={'title':'Test item','description':'New description','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response.status_code,201)
        created_item = WorkItem.objects.get(title='Test item')
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.id}/",data=json.dumps({'status':'OO'}), content_type="application/json")        
        self.assertEqual(patch_response.status_code,400)
        created_item.refresh_from_db()
        self.assertEqual(created_item.status,'OP')
    def test_update_title_description_status(self):
        created_item = self.client.post(path="/api/v1/workitem/",data={"title":"First case","description":"Some information","status":"OP"})       
        patch_data={"title":"Second case","description":"New","status":"IP"}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")        
        self.assertEqual(patch_response.status_code,200)
        item_in_db=WorkItem.objects.get(pk=created_item.json()['id'])

        self.assertEqual(patch_response.json()['title'],item_in_db.title)
        self.assertEqual(patch_response.json()['description'],item_in_db.description)
        self.assertEqual(patch_response.json()['status'],item_in_db.status)

        self.assertEqual(patch_data['title'],item_in_db.title)
        self.assertEqual(patch_data['description'],item_in_db.description)
        self.assertEqual(patch_data['status'],item_in_db.status)

    def test_update_partial(self):
        created_item=self.client.post(path="/api/v1/workitem/",data={"title":"First case", "description":"Some information","status":"OP"})
        original_title = created_item.json()['title']
        original_status = created_item.json()['status']
        patch_data={'description':'New'}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")        
        item_from_db = WorkItem.objects.get(pk=created_item.json()['id'])
        self.assertEqual(patch_response.status_code,200)
        self.assertEqual(patch_data['description'],item_from_db.description)
        self.assertEqual(patch_response.json()['title'],item_from_db.title)
        self.assertEqual(patch_response.json()['description'],item_from_db.description)
        self.assertEqual(patch_response.json()['status'],item_from_db.status)

        self.assertEqual(patch_response.json()['title'],original_title)
        self.assertEqual(patch_response.json()['status'],original_status)

    def test_update_empty_title(self):
        created_item=self.client.post(path="/api/v1/workitem/",data={"title":"First case","description":"Some information","status":"OP"})
        patch_data={'title':''}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")        
        item_from_db = WorkItem.objects.get(pk=created_item.json()['id'])
        self.assertEqual(patch_response.status_code,400)
        self.assertEqual(item_from_db.title,'First case')
    def test_long_title(self):
        created_item=self.client.post(path="/api/v1/workitem/",data={"title":"First case","description":"Some information","status":"OP"})
        patch_data={'title':f'{'x'*201}'}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")        
        self.assertEqual(patch_response.status_code,400)
        self.assertEqual(created_item.json()['title'],'First case')
    def test_update_priority(self):
        created_item=self.client.post(path="/api/v1/workitem/",data={"title":"First case","description":"Some information","status":"OP"})
        patch_data={'priority':'HI'}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")  
        self.assertEqual(patch_response.status_code,200)
        item = WorkItem.objects.get(title='First case')
        self.assertEqual(patch_response.json()['priority'],item.priority)
        self.assertEqual(patch_data['priority'],item.priority)
    def test_update__wrong_priority(self):
        created_item=self.client.post(path="/api/v1/workitem/",data={"title":"First case","description":"Some information","status":"OP"})
        patch_data={'priority':'XX'}
        patch_response = self.client.patch(path=f"/api/v1/workitem/{created_item.json()['id']}/",data=json.dumps(patch_data), content_type="application/json")  
        self.assertEqual(patch_response.status_code,400)
        self.assertEqual(created_item.json()['priority'],'ME')


class WorkItemOwnersTests(TestCase):
    def test_owner(self):
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response = self.client.post(path="/api/v1/workitem/",data={"title":'Title one',"status":"IP"})
        self.assertEqual(response.status_code,201)
        item_in_db = WorkItem.objects.get(pk=response.json()['id'])
        self.assertEqual(item_in_db.owner.username,'Andre') 
    def test_two_owners(self):
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response = self.client.post(path="/api/v1/workitem/",data={"title":'Title one',"status":"IP"})
        self.assertEqual(response.status_code,201)
        self.client.post(path='/api/v1/auth/logout/')
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response_get = self.client.get(path="/api/v1/workitem/")
        self.assertEqual(len(response_get.json()['results']),0)
    def test_two_owners_patch_another_item(self):
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response = self.client.post(path="/api/v1/workitem/",data={"title":'Title one',"status":"IP"})
        self.assertEqual(response.status_code,201)
        self.client.post(path='/api/v1/auth/logout/')
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response_get = self.client.patch(path=f"/api/v1/workitem/{response.json()["id"]}/",data={"title":'Newone'}, content_type="application/json")
        self.assertEqual(response_get.status_code,404)
        item_in_db = WorkItem.objects.get(pk=response.json()['id'])
        self.assertNotEqual(item_in_db.title,"Newone")    
    def test_two_owners_delete_another_item(self):
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response = self.client.post(path="/api/v1/workitem/",data={"title":'Title one',"status":"IP"})
        self.assertEqual(response.status_code,201)
        self.client.post(path='/api/v1/auth/logout/')
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response_get = self.client.delete(path=f"/api/v1/workitem/{response.json()["id"]}/", content_type="application/json")
        self.assertEqual(response_get.status_code,404)
        item_in_db = WorkItem.objects.get(pk=response.json()['id'])
    def test_post_item_different_owner(self):
        user_one=self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        user_two=self.client.post(data={'username':'Peter', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andre', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        user_two_id=User.objects.get(username='Peter').id
        response=self.client.post(path='/api/v1/workitem/',data={"title":'NewOne',"description":"some text","status":"IP","owner":f"{user_two_id}"})
        self.assertEqual(response.status_code,201)
        item_in_db = WorkItem.objects.get(pk=response.json()['id'])
        self.assertEqual(item_in_db.owner.username,'Andre')
        



    

  



class WorkItemGetTests(TestCase):
    def setUp(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        first_item = self.client.post(path='/api/v1/workitem/', data={"title":"First case","status":"IP"})
        second_item = self.client.post(path='/api/v1/workitem/', data={"title":"Second case","status":"DN"})
        third_item = self.client.post(path='/api/v1/workitem/', data={"title":"Third case","status":"OP"})
       
        now = timezone.now()
        print()
        WorkItem.objects.filter(pk=third_item.json()['id']).update(created_at=now)
        WorkItem.objects.filter(pk=second_item.json()['id']).update(created_at=now - timedelta(days=2))
        WorkItem.objects.filter(pk=first_item.json()['id']).update(created_at=now - timedelta(days=1))
    def test_get_work_item(self):
        WorkItem.objects.all().delete()
        response = self.client.get("/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),0)
    def test_get_two_work_items(self):
        WorkItem.objects.filter(status='OP').delete()
        response = self.client.get("/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),2)
        list_of_titles = [ i['title']for i in response.json()['results'] if 'title' in i]
        self.assertIn('First case',list_of_titles)
        self.assertIn('Second case',list_of_titles)
    def test_get_filtered_status_OP(self):
        self.client.post(path="/api/v1/workitem/",data={"title":"Fourth case", "status":"OP"})
        response = self.client.get(path="/api/v1/workitem/", data={'status':'OP'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),2)
        titles = [item['title']for item in response.json()['results']]
        self.assertCountEqual(titles,['Third case','Fourth case'])
        statuses = [item['status']for item in response.json()['results']]
        self.assertCountEqual(statuses,['OP','OP'])
    def test_get_filtered_status_DN(self):
        response_fourth = self.client.post(data={'title':'Fourth case','status':'DN'},path='/api/v1/workitem/')
        self.assertEqual(response_fourth.status_code,201)
        response = self.client.get(path="/api/v1/workitem/",data={'status':'DN'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),2)
        titles = [item['title']for item in response.json()['results']]
        self.assertCountEqual(titles,['Second case', 'Fourth case'])
        statuses = [item['status']for item in response.json()['results']]
        self.assertCountEqual(statuses,['DN','DN'])
    def test_get_filtered_status_wrong(self):
        response = self.client.get(path="/api/v1/workitem/",data={'status':'XX'})
        self.assertEqual(response.status_code,400)
    def test_get_by_search(self):
        response=self.client.get(path="/api/v1/workitem/",query_params={'search':'First'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),1)
        self.assertEqual(response.json()['results'][0]['title'],'First case')
    def test_get_by_search_insensitive(self):
        response=self.client.get(path="/api/v1/workitem/",query_params={'search':'FIRST'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),1)
        self.assertEqual(response.json()['results'][0]['title'],'First case')
    def test_get_by_search_and_filter(self):
        self.client.post(path="/api/v1/workitem/",data={"title":"Fourth case","status":"OP"})
        self.client.post(path="/api/v1/workitem/",data={"title":"Fourth case new","status":"DN"})
        response=self.client.get(path="/api/v1/workitem/", query_params={'search':'Fourth','status':'OP'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),1)
        self.assertEqual(response.json()['results'][0]['title'],'Fourth case')
    def test_get_by_empty_search(self):
        response=self.client.get(path="/api/v1/workitem/", query_params={'search':''})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),3)
    def test_ordering_ascending_get(self):
        response=self.client.get(path="/api/v1/workitem/", query_params={'ordering':'created_at'})
        self.assertEqual(response.status_code,200)
        dates=[i['created_at']for i in response.json()['results']]
        self.assertEqual(dates,sorted(dates,reverse=False))
    def test_ordering_descending_get(self):
        response=self.client.get(path='/api/v1/workitem/', query_params={'ordering':'-created_at'})
        self.assertEqual(response.status_code,200)
        dates=[i['created_at']for i in response.json()['results']]
        self.assertEqual(dates,sorted(dates,reverse=True))
    def test_ordering_default_get(self):
        response=self.client.get(path='/api/v1/workitem/')
        self.assertEqual(response.status_code,200)
        dates=[i['created_at']for i in response.json()['results']]
        self.assertEqual(dates,sorted(dates,reverse=True))
    def test_ordering_wrong_value(self):
        response=self.client.get(path='/api/v1/workitem/', query_params={'ordering':'wrong'})
        self.assertEqual(response.status_code,400)
    def test_pagination_first_page(self):
        for i in range(20):
            self.client.post(path="/api/v1/workitem/",data={"title":f"{i} case+","status":"IP"})
        response=self.client.get(path="/api/v1/workitem/", query_params={'page':1})
        self.assertEqual(response.json()['count'],WorkItem.objects.all().count())
        self.assertEqual(len(response.json()['results']),10)
        self.assertEqual(response.json()['num_pages'],3)
        self.assertEqual(response.json()['current_page'],1)
        self.assertEqual(response.json()['next'],2)
        self.assertEqual(response.json()['previous'],None)
    def test_pagination_last_page(self):
        for i in range(20):
            self.client.post(path="/api/v1/workitem/",data={"title":f"{i} case+","status":"IP"})
        response=self.client.get(path="/api/v1/workitem/", query_params={'page':3})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),3)
        self.assertEqual(response.json()['next'],None)
        self.assertEqual(response.json()['previous'],2)
    def test_pagination_wrong_page(self):
        response=self.client.get(path="/api/v1/workitem/", query_params={'page':'abc'})
        self.assertEqual(response.status_code,400)
    def test_pagination_empty_page(self):
        response=self.client.get(path="/api/v1/workitem/", query_params={'page':9999})
        self.assertEqual(response.status_code,404)
    def test_pagination_without_page(self):
        for i in range(20):
            self.client.post(path="/api/v1/workitem/",data={"title":f"{i} case+","status":"IP"})
        response=self.client.get(path="/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),10)


class WorkItemAuthorizedTests(TestCase):
    def setUp(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        first_item = self.client.post(path="/api/v1/workitem/", data={"title":"First case","status":"IP"})
    def test_anonymous_get_item(self):
        self.client.post(path='/api/v1/auth/logout/')
        response = self.client.get(path="/api/v1/workitem/",data={'title':'First case'})
        self.assertEqual(response.status_code,403)
    def test_anonymous_post_item(self):
        self.client.post(path='/api/v1/auth/logout/')
        response = self.client.post(path="/api/v1/workitem/",data={'title':'Second case','description':'Description','status':'IP'})
        self.assertEqual(response.status_code,403)
    def test_authorized_get_item(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        response = self.client.get(path="/api/v1/workitem/",data={'title':'First case'})
        self.assertEqual(response.status_code,200)
    def test_authorized_post_item(self):
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/register/')
        self.client.post(data={'username':'Andrii', 'password':'Five234oaks!'}, path='/api/v1/auth/login/')
        second_item = self.client.post(path="/api/v1/workitem/",data={'title':'Second case','description':'description','status':'IP'})
        self.assertEqual(second_item.status_code,201)
        self.assertEqual(WorkItem.objects.filter(title='Second case').count(),1)












































