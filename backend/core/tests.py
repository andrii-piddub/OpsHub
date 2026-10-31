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



