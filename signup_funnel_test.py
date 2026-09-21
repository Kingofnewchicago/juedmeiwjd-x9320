#!/usr/bin/env python3
"""
Focused Backend Test: /signup Quick-Application Funnel
Tests the new landing page submission flow with minimal fields + empty address fields
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL from frontend/.env
BASE_URL = "https://yo-app-107.preview.emergentagent.com/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "admin@webora.de"
ADMIN_PASSWORD = "Kp9!xRv2Lq@Zm7Tn4&Q"

# Test results
results = {
    "passed": [],
    "failed": [],
}

def log_pass(test_name, details=""):
    print(f"✅ PASS: {test_name}")
    if details:
        print(f"   {details}")
    results["passed"].append(test_name)

def log_fail(test_name, details=""):
    print(f"❌ FAIL: {test_name}")
    if details:
        print(f"   {details}")
    results["failed"].append({"test": test_name, "details": details})

print("=" * 80)
print("SIGNUP FUNNEL TEST - Quick Application with Empty Address Fields")
print("=" * 80)
print()

# Generate unique email for this test run
unique_email = f"signup.test.{uuid.uuid4().hex[:8]}@example.com"
print(f"Using unique email: {unique_email}")
print()

# Test 1: Submit application with empty address fields
print("Test 1: Submit Quick Application (Empty Address Fields)")
print("-" * 80)
try:
    application_data = {
        "name": "Signup Test User",
        "email": unique_email,
        "mobilnummer": "+49 170 9998877",
        "geburtsdatum": "1995-06-15",
        "staatsangehoerigkeit": "",
        "strasse": "",
        "postleitzahl": "",
        "stadt": "",
        "position": "Remote Application Tester",
        "message": "Schnellbewerbung über /signup (Kampagne)",
        "password": "A1a!abcd1234",
        "cv_filename": None,
        "referral_slug": None
    }
    
    response = requests.post(
        f"{BASE_URL}/applications/submit",
        json=application_data,
        timeout=10
    )
    
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        applicant_id = data.get("id")
        applicant_status = data.get("status")
        applicant_position = data.get("position")
        
        log_pass("Application submitted with HTTP 200", f"ID: {applicant_id}")
        
        # Verify response contains id
        if applicant_id:
            log_pass("Response contains 'id' field", f"ID: {applicant_id}")
        else:
            log_fail("Response missing 'id' field", f"Response: {data}")
        
        # Verify status is "Neu"
        if applicant_status == "Neu":
            log_pass("Application status is 'Neu'", f"Status: {applicant_status}")
        else:
            log_fail("Application status is not 'Neu'", f"Expected 'Neu', got '{applicant_status}'")
        
        # Verify position is correct
        if applicant_position == "Remote Application Tester":
            log_pass("Position field preserved correctly", f"Position: {applicant_position}")
        else:
            log_fail("Position field incorrect", f"Expected 'Remote Application Tester', got '{applicant_position}'")
        
        # Verify empty address fields were accepted
        if data.get("staatsangehoerigkeit") == "" and data.get("strasse") == "" and data.get("postleitzahl") == "" and data.get("stadt") == "":
            log_pass("Empty address fields accepted", "staatsangehoerigkeit/strasse/postleitzahl/stadt = ''")
        else:
            log_fail("Empty address fields not preserved", f"staatsangehoerigkeit={data.get('staatsangehoerigkeit')}, strasse={data.get('strasse')}, postleitzahl={data.get('postleitzahl')}, stadt={data.get('stadt')}")
        
    else:
        log_fail("Application submission failed", f"Status: {response.status_code}, Response: {response.text}")
        applicant_id = None
        
except Exception as e:
    log_fail("Application submission exception", str(e))
    applicant_id = None

print()

# Test 2: Admin Login
print("Test 2: Admin Login")
print("-" * 80)
try:
    response = requests.post(
        f"{BASE_URL}/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        admin_token = data.get("access_token")
        if admin_token:
            log_pass("Admin login successful", f"Token received")
        else:
            log_fail("Admin login - no token", f"Response: {data}")
    else:
        log_fail("Admin login failed", f"Status: {response.status_code}, Response: {response.text}")
        admin_token = None
except Exception as e:
    log_fail("Admin login exception", str(e))
    admin_token = None

print()

# Test 3: Verify application appears in admin list
print("Test 3: Verify Application in Admin List")
print("-" * 80)
if admin_token and applicant_id:
    try:
        response = requests.get(
            f"{BASE_URL}/applications/",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            applications = response.json()
            
            # Find our application
            found_app = None
            for app in applications:
                if app.get("email") == unique_email:
                    found_app = app
                    break
            
            if found_app:
                log_pass("Application found in admin list", f"Email: {found_app.get('email')}")
                
                # Verify position
                if found_app.get("position") == "Remote Application Tester":
                    log_pass("Position visible in admin list", f"Position: {found_app.get('position')}")
                else:
                    log_fail("Position incorrect in admin list", f"Expected 'Remote Application Tester', got '{found_app.get('position')}'")
                
                # Verify status
                if found_app.get("status") == "Neu":
                    log_pass("Status is 'Neu' in admin list")
                else:
                    log_fail("Status incorrect in admin list", f"Expected 'Neu', got '{found_app.get('status')}'")
            else:
                log_fail("Application not found in admin list", f"Searched for email: {unique_email}")
        else:
            log_fail("Admin applications list fetch failed", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_fail("Admin applications list exception", str(e))
else:
    log_fail("Admin list test skipped", "No admin token or applicant ID")

print()

# Test 4: Duplicate email check (should return HTTP 400)
print("Test 4: Duplicate Email Check")
print("-" * 80)
try:
    # Try to submit the same email again
    duplicate_data = {
        "name": "Another User",
        "email": unique_email,  # Same email as before
        "mobilnummer": "+49 170 1234567",
        "geburtsdatum": "1990-01-01",
        "staatsangehoerigkeit": "",
        "strasse": "",
        "postleitzahl": "",
        "stadt": "",
        "position": "Another Position",
        "message": "Duplicate test",
        "password": "DifferentPass123!",
        "cv_filename": None,
        "referral_slug": None
    }
    
    response = requests.post(
        f"{BASE_URL}/applications/submit",
        json=duplicate_data,
        timeout=10
    )
    
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 400:
        log_pass("Duplicate email rejected with HTTP 400", f"Response: {response.text}")
    else:
        log_fail("Duplicate email not rejected", f"Expected HTTP 400, got {response.status_code}. Response: {response.text}")
        
except Exception as e:
    log_fail("Duplicate email check exception", str(e))

print()

# Summary
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {len(results['passed'])}")
for test in results['passed']:
    print(f"   - {test}")
print()

if results['failed']:
    print(f"❌ FAILED: {len(results['failed'])}")
    for failure in results['failed']:
        print(f"   - {failure['test']}: {failure['details']}")
    print()
    print("OVERALL RESULT: FAILED ❌")
    exit(1)
else:
    print("OVERALL RESULT: PASSED ✅")
    print()
    print("🎉 The /signup quick-application funnel is working correctly!")
    print("   - Empty address fields are accepted")
    print("   - Applications appear in admin list")
    print("   - Duplicate emails are rejected")

print("=" * 80)
