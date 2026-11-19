from rest_framework import serializers
from .models import SupportCases


class SupportCasesSerializer(serializers.ModelSerializer):
  class Meta:
    model = SupportCases
    fields = ['id','acumatica_uuid','case_id','business_account','subject','status','reason','severity','priority','owner_employee_name','workgroup','case_class','reported_on','last_incoming_activity','last_outgoing_activity','contract','billable','active','acumatica_modified_at','synced_at','description','contact_name','contact_id','status_code','closed_at','acumatica_owner_ref' ]
    read_only_fields = ['owner']
    
