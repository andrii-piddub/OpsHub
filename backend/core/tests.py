from django.test import TestCase
from .models import WorkItem
import json
from datetime import timedelta
from django.utils import timezone

# Create your tests here.
class WorkItemDeleteTests(TestCase): 
    def test_delete_existing_work_item(self):
        new_Item = WorkItem.objects.create(title="new2", description="new description")
        response = self.client.delete(path=f"/api/v1/workitem/{new_Item.id}/")
        self.assertEqual(response.status_code,204)
        self.assertFalse(WorkItem.objects.filter(id=new_Item.id).exists())
    def test_delete_nonexistent_work_item(self):
        response = self.client.delete(path="/api/v1/workitem/9999999/")
        self.assertEqual(response.status_code,404)

class WorkItemCreateTests(TestCase):
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


class WorkItemUpdateTests(TestCase):
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

class WorkItemGetTests(TestCase):
    def setUp(self):
        first_item = WorkItem.objects.create(title='First case', status='IP')
        second_item = WorkItem.objects.create(title='Second case', status='DN')
        third_item = WorkItem.objects.create(title='Third case',status='OP')

        now = timezone.now()
        WorkItem.objects.filter(pk=third_item.pk).update(created_at=now)
        WorkItem.objects.filter(pk=second_item.pk).update(created_at=now - timedelta(days=2))
        WorkItem.objects.filter(pk=first_item.pk).update(created_at=now - timedelta(days=1))
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
        WorkItem.objects.create(title='Fourth case', status='OP')
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
        WorkItem.objects.create(title='Fourth case',status='OP')
        WorkItem.objects.create(title='Fourth case new',status='DN')
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
            WorkItem.objects.create(title=f'{i} case+', status='IP')
        response=self.client.get(path="/api/v1/workitem/", query_params={'page':1})
        self.assertEqual(response.json()['count'],WorkItem.objects.all().count())
        self.assertEqual(len(response.json()['results']),10)
        self.assertEqual(response.json()['num_pages'],3)
        self.assertEqual(response.json()['current_page'],1)
        self.assertEqual(response.json()['next'],2)
        self.assertEqual(response.json()['previous'],None)
    def test_pagination_last_page(self):
        for i in range(20):
            WorkItem.objects.create(title=f'{i} case+', status='IP')
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
            WorkItem.objects.create(title=f'{i} case+', status='IP')
        response=self.client.get(path="/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()['results']),10)


        













































