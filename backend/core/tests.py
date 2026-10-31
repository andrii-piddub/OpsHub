from django.test import TestCase
from .models import WorkItem
import json


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
        self.assertEqual(len(response_get.json()),0)
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
    def test_get_work_item(self):
        response = self.client.get("/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()),0)
    def test_get_two_work_items(self):
        response_one = self.client.post(data={'title':'First test','description':'New description','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response_one.status_code,201)
        response_two = self.client.post(data={'title':'Second test','description':'New description','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response_two.status_code,201)
        response = self.client.get("/api/v1/workitem/")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()),2)
        list_of_titles = [ i['title']for i in response.json() if 'title' in i]
        self.assertIn('First test',list_of_titles)
        self.assertIn('Second test',list_of_titles)
    def test_get_filtered_status_OP(self):
        response_one = self.client.post(data={'title':'First test','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response_one.status_code,201)
        response_second = self.client.post(data={'title':'Second test','status':'OP'},path='/api/v1/workitem/')
        self.assertEqual(response_second.status_code,201)
        response_third = self.client.post(data={'title':'Third test','status':'DN'},path='/api/v1/workitem/')
        self.assertEqual(response_third.status_code,201)
        response = self.client.get(path="/api/v1/workitem/",data={'status':'OP'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()),2)
        titles = [item['title']for item in response.json()]
        self.assertCountEqual(titles,['First test', 'Second test'])
        statuses = [item['status']for item in response.json()]
        self.assertCountEqual(statuses,['OP','OP'])
    def test_get_filtered_status_DN(self):
        response_one = self.client.post(data={'title':'First test','status':'DN'},path='/api/v1/workitem/')
        self.assertEqual(response_one.status_code,201)
        response_second = self.client.post(data={'title':'Second test','status':'DN'},path='/api/v1/workitem/')
        self.assertEqual(response_second.status_code,201)
        response_third = self.client.post(data={'title':'Third test','status':'IP'},path='/api/v1/workitem/')
        self.assertEqual(response_third.status_code,201)
        response = self.client.get(path="/api/v1/workitem/",data={'status':'DN'})
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.json()),2)
        titles = [item['title']for item in response.json()]
        self.assertCountEqual(titles,['First test', 'Second test'])
        statuses = [item['status']for item in response.json()]
        self.assertCountEqual(statuses,['DN','DN'])
    def test_get_filtered_status_wrong(self):
        response = self.client.get(path="/api/v1/workitem/",data={'status':'XX'})
        self.assertEqual(response.status_code,400)
















