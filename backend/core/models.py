from django.db import models
from accounts.models import User

class WorkItem(models.Model):
  different_status = {'OP':'OPEN','IP':'IN_PROGRESS','DN':'DONE'}
  different_priorities={'LO':'Low','ME':'Medium','HI':'High'}
  title=models.CharField(max_length=200)
  description=models.TextField(blank=True)
  priority = models.CharField(max_length=2, choices=different_priorities,default='ME')
  status = models.CharField(max_length=2, choices=different_status,default='OP')
  owner = models.ForeignKey(User, on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  


  def __str__(self):
    return self.title