from django.db import models

class SupportCases(models.Model):
    id = models.BigAutoField(primary_key=True)
    acumatica_uuid = models.UUIDField(unique=True, db_index=True)
    case_id = models.CharField(max_length=50, unique=True,db_index=True)
    business_account=models.CharField(max_length=100, blank=True)
    subject = models.CharField(max_length=255,blank=True)
    status = models.CharField(max_length=100, blank=True) 
    reason = models.CharField(max_length=100, blank=True)
    severity = models.CharField(max_length=100, blank=True)
    priority = models.CharField(max_length=100, blank=True)
    owner_employee_name = models.CharField(max_length=255, blank=True, db_index=True)
    workgroup = models.CharField(max_length=255,blank=True)
    case_class = models.CharField(max_length=100, blank=True)
    reported_on = models.DateTimeField(null=True,blank=True)
    last_incoming_activity=models.DateTimeField(null=True,blank=True)
    last_outgoing_activity = models.DateTimeField(null=True,blank=True)
    contract = models.CharField(max_length=100,blank=True)
    billable = models.BooleanField(null=True,blank=True)
    active= models.BooleanField(null=True,blank=True)
    acumatica_modified_at = models.DateTimeField(null=True, blank=True)
    synced_at = models.DateTimeField(null=True, blank=True, )
    description = models.TextField(blank=True)
    contact_name = models.CharField(max_length=255,blank=True)
    contact_id = models.IntegerField(null=True,blank=True)
    status_code = models.CharField(max_length=10, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    acumatica_owner_ref = models.CharField(max_length=100,blank=True)


    def __str__(self):
        return self.acumatica_uuid