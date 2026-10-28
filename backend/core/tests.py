from django.test import TestCase
from .models import WorkItem


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