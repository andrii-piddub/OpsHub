from django.shortcuts import render
import re
import secrets
from urllib.parse import urlencode
from django.http import HttpResponse, HttpResponseBadRequest
from django.conf import settings
from django.shortcuts import redirect
import requests
import time
from django.http import JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import SupportCases
from django.utils import timezone
from html import unescape
from django.utils.html import strip_tags
from .serializers import SupportCasesSerializer 

def _case_value(case, field, default=None):
    value = (case.get(field) or {}).get("value")
    return default if value is None else value


def acumatica_connect(request):
    state = secrets.token_urlsafe(32)
    request.session["acumatica_oauth_state"] = state
    return_to = request.GET.get("return_to", "settings")
    request.session["acumatica_return_to"] = return_to
    params = {
        "response_type": "code",
        "client_id": settings.ACUMATICA_CLIENT_ID,
        "redirect_uri": settings.ACUMATICA_REDIRECT_URI,
        "scope": "api offline_access",
        "state": state,
    }
    base_url = settings.ACUMATICA_BASE_URL.rstrip("/")
    authorization_url = (
        f"{base_url}/identity/connect/authorize?{urlencode(params)}"
    )

    return redirect(authorization_url)

def acumatica_callback(request):
    expected_state = request.session.pop("acumatica_oauth_state", None)
    received_state = request.GET.get("state")
    return_to = request.session.pop("acumatica_return_to", "settings")
    routes = {
    "settings": "/settings/",
    "supportcases": "/supportcases/",
}


    if (
        not expected_state
        or not received_state
        or not secrets.compare_digest(expected_state, received_state)
    ):
        return HttpResponseBadRequest("Некоректний OAuth state.")

    if request.GET.get("error"):
        return HttpResponseBadRequest("Авторизацію Acumatica не завершено.")

    code = request.GET.get("code")
    if not code:
        return HttpResponseBadRequest("Acumatica не повернула код авторизації.")

    token_url = (
        f"{settings.ACUMATICA_BASE_URL.rstrip('/')}/identity/connect/token"
    )

    try:
        response = requests.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.ACUMATICA_CLIENT_ID,
                "client_secret": settings.ACUMATICA_CLIENT_SECRET,
                "redirect_uri": settings.ACUMATICA_REDIRECT_URI,
            },
            timeout=15,
        )
    except requests.RequestException:
        return HttpResponse(
            "Не вдалося з’єднатися з Acumatica.",
            status=502,
        )

    if response.status_code != 200:
        return HttpResponse(
            f"Acumatica відхилила обмін коду. HTTP {response.status_code}.",
            status=502,
        )

    try:
        tokens = response.json()
    except ValueError:
        return HttpResponse("Acumatica повернула некоректний JSON.", status=502)

    if not tokens.get("access_token"):
        return HttpResponse("У відповіді немає access_token.", status=502)
    request.session["acumatica_tokens"] = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token"),
        "expires_at": time.time() + int(tokens.get("expires_in", 0)),
    }
    return redirect(
    f"http://localhost:5173{routes.get(return_to, '/settings/')}"
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def acumatica_cases(request):
    tokens = request.session.get("acumatica_tokens", {})
    access_token = tokens.get("access_token")

    if not access_token:
        return Response(
            {"error": "Спочатку підключи Acumatica через /connect/."},
            status=401,
        )

    base_url = settings.ACUMATICA_BASE_URL.rstrip("/")
    endpoint = settings.ACUMATICA_ENDPOINT_NAME
    version = settings.ACUMATICA_ENDPOINT_VERSION

    url = f"{base_url}/entity/{endpoint}/{version}/Case"

    try:
        owner_name = request.user.acumatica_employee_name.strip()
        if not owner_name:
            return Response(
        {"error": "Прив’яжи працівника Acumatica в Settings."},
        status=400,
    )
        owner_name = owner_name.replace("'", "''")
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
            timeout=30,
            params={"$filter": f"OwnerEmployeeName eq '{owner_name}'"},

        )
    except requests.RequestException:
        return Response(
            {"error": "Не вдалося з’єднатися з Acumatica."},
            status=502,
        )

    if response.status_code != 200:
        return Response(
            {
                "error": "Acumatica відхилила запит.",
                "upstream_status": response.status_code,
            },
            status=502,
        )

    try:
        cases = response.json()
    except ValueError:
        return Response(
            {"error": "Acumatica повернула некоректний JSON."},
            status=502,
        )
    for case in cases:
        raw_description = _case_value(case, "Description", "")
        description_without_css = re.sub(
            r"<style\b[^>]*>.*?</style\s*>", "", raw_description, flags=re.IGNORECASE | re.DOTALL
        )
        status = _case_value(case, "Status")
        status_details = status if isinstance(status, dict) else {}
        status_label = status_details.get("description") if isinstance(status, dict) else status
        SupportCases.objects.update_or_create(
            acumatica_uuid=case["id"],
            defaults={
                "case_id": case["CaseID"]["value"],
                "business_account": _case_value(case, "BusinessAccount", ""),
                "subject": _case_value(case, "Subject", ""),
                "reason": _case_value(case, "Reason", ""),
                "severity": _case_value(case, "Severity", ""),
                "priority": _case_value(case, "Priority", ""),
                "owner_employee_name": _case_value(case, "OwnerEmployeeName", ""),
                "workgroup": _case_value(case, "Workgroup", ""),
                "case_class": _case_value(case, "ClassID", ""),
                "reported_on": _case_value(case, "DateReported"),
                "last_incoming_activity": _case_value(case, "LastIncomingActivity"),
                "last_outgoing_activity": _case_value(case, "LastOutgoingActivity"),
                "contract": _case_value(case, "Contract", ""),
                "billable": _case_value(case, "Billable"),
                "active": _case_value(case, "IsActive"),
                "acumatica_modified_at": _case_value(case, "LastModifiedDateTime"),
                "description": unescape(strip_tags(description_without_css)).strip(),
                "contact_name": _case_value(case, "ContactDisplayName", ""),
                "contact_id": _case_value(case, "ContactID"),
                "closed_at": _case_value(case, "ClosingDate"),
                "acumatica_owner_ref": _case_value(case, "Owner", ""),
                "status": status_label or "",
                "status_code": status_details.get("id") or "",
                "synced_at": timezone.now(),
            },
        )
    saved_cases = SupportCases.objects.filter(owner_employee_name=request.user.acumatica_employee_name.strip(),
)

    return Response({"cases": SupportCasesSerializer(saved_cases, many=True).data,
})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def acumatica_employee(request):
    tokens = request.session.get("acumatica_tokens", {})
    access_token = tokens.get("access_token")
    employee_id = request.GET.get("employee_id")

    if not employee_id:
        return JsonResponse(
        {"error": "Потрібно передати employee_id."},
        status=400,
    )
    if not access_token:
        return Response(
            {"code": "acumatica_auth_required",
            "error": "Спочатку підключи Acumatica через /connect/."},
            status=401,
        )

    base_url = settings.ACUMATICA_BASE_URL.rstrip("/")
    endpoint = settings.ACUMATICA_ENDPOINT_NAME
    version = settings.ACUMATICA_ENDPOINT_VERSION

    url = f"{base_url}/entity/{endpoint}/{version}/Employee"
    employee_id = employee_id.replace("'", "''")


    try:
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
            timeout=30,
        params={
         "$filter": f"EmployeeID eq '{employee_id}'",
        "$expand": "ContactInfo",
},

            
        )
        print("Acumatica status:", response.status_code)    
        print("Acumatica body:", response.text)
    except requests.RequestException:
        return Response(
            {"error": "Не вдалося з’єднатися з Acumatica."},
            status=502,
        )
    if response.status_code != 200:
        return Response(
            {
                "error": "Acumatica відхилила запит.",
                "upstream_status": response.status_code,
            },
            status=502,
        )

    try:
        employees = response.json()
    except ValueError:
        return Response(
            {"error": "Acumatica повернула некоректний JSON."},
            status=502,
        )

    return Response({"employees": employees})