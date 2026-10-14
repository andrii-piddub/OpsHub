from django.db import models

class WorkItem(models.Model):
  different_status = {'OP':'OPEN','IP':'IN_PROGRESS','DN':'DONE'}
  title=models.CharField(max_length=200)
  description=models.CharField(max_length=300, required=False)
  status = models.CharField(max_length=2, choices=different_status,default='OP')
  created_at = models.DateTimeField(auto_now_add=True)


  def __str__(self):
    return self.title