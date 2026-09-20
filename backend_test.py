#!/usr/bin/env python3
"""
Backend Regression Test for MORE Applications GmbH Rebrand
Tests contract templates, application flow, and contract generation
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
    "warnings": []
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

def log_warning(test_name, details=""):
    print(f"⚠️  WARNING: {test_name}")
    if details:
        print(f"   {details}")
    results["warnings"].append({"test": test_name, "details": details})

print("=" * 80)
print("BACKEND REGRESSION TEST - MORE Applications GmbH Rebrand")
print("=" * 80)
print()

# Test 1: Admin Login
print("Test 1: Admin Login")
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
            log_pass("Admin login successful", f"Token received: {admin_token[:20]}...")
        else:
            log_fail("Admin login - no token", f"Response: {data}")
    else:
        log_fail("Admin login failed", f"Status: {response.status_code}, Response: {response.text}")
        admin_token = None
except Exception as e:
    log_fail("Admin login exception", str(e))
    admin_token = None

print()

# Test 2: Submit New Application
print("Test 2: Submit New Application")
print("-" * 80)
try:
    # Generate unique email for this test
    unique_email = f"test.applicant.{uuid.uuid4().hex[:8]}@example.com"
    
    application_data = {
        "name": "Max Mustermann",
        "email": unique_email,
        "password": "SecurePass123!",
        "mobilnummer": "+491234567890",
        "geburtsdatum": "1990-01-15",
        "staatsangehoerigkeit": "Deutsch",
        "strasse": "Teststraße 123",
        "postleitzahl": "12345",
        "stadt": "Berlin",
        "position": "Software Tester",
        "cv_filename": None,
        "referral_slug": None
    }
    
    response = requests.post(
        f"{BASE_URL}/applications/submit",
        json=application_data,
        timeout=10
    )
    
    if response.status_code in [200, 201]:
        data = response.json()
        applicant_id = data.get("id")
        applicant_email = data.get("email")
        log_pass("Application submitted successfully", f"ID: {applicant_id}, Email: {applicant_email}")
    else:
        log_fail("Application submission failed", f"Status: {response.status_code}, Response: {response.text}")
        applicant_id = None
        applicant_email = None
except Exception as e:
    log_fail("Application submission exception", str(e))
    applicant_id = None
    applicant_email = None

print()

# Test 3: Contract Templates (version 5 check)
print("Test 3: Contract Templates (version 5)")
print("-" * 80)
if admin_token:
    try:
        response = requests.get(
            f"{BASE_URL}/applications/contract-templates",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            templates = response.json()
            if isinstance(templates, list) and len(templates) > 0:
                log_pass("Contract templates fetched", f"Found {len(templates)} templates")
                
                # Check template version
                all_v5 = True
                has_more_applications = False
                has_old_branding = False
                
                for tpl in templates:
                    version = tpl.get("template_version", 0)
                    body = tpl.get("body_html", "")
                    
                    if version != 5:
                        all_v5 = False
                        log_fail(f"Template {tpl.get('type')} version mismatch", f"Expected v5, got v{version}")
                    
                    # Check for MORE Applications GmbH
                    if "MORE Applications GmbH" in body:
                        has_more_applications = True
                    
                    # Check for old branding
                    if any(old in body for old in ["Tdata", "Mariusz", "Ginsheim"]):
                        has_old_branding = True
                        log_fail(f"Template {tpl.get('type')} contains old branding", 
                                f"Found old text in body")
                
                if all_v5:
                    log_pass("All templates are version 5")
                
                if has_more_applications:
                    log_pass("Templates contain 'MORE Applications GmbH'")
                else:
                    log_fail("Templates missing 'MORE Applications GmbH'")
                
                if not has_old_branding:
                    log_pass("No old branding found in templates")
            else:
                log_fail("Contract templates empty", f"Response: {templates}")
        else:
            log_fail("Contract templates fetch failed", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_fail("Contract templates exception", str(e))
else:
    log_fail("Contract templates test skipped", "No admin token available")

print()

# Test 4: Accept Application and Assign Contract Type
print("Test 4: Accept Application and Assign Contract Type")
print("-" * 80)
if admin_token and applicant_id:
    try:
        response = requests.post(
            f"{BASE_URL}/applications/{applicant_id}/accept",
            json={
                "contract_type": "vollzeit",
                "start_date": "01.09.2026",
                "allow_skip": False
            },
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            log_pass("Application accepted", f"Status: {data.get('status')}, Contract: {data.get('contract_type')}")
        else:
            log_fail("Application acceptance failed", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_fail("Application acceptance exception", str(e))
else:
    log_fail("Application acceptance test skipped", "No admin token or applicant ID")

print()

# Test 5: Applicant Login
print("Test 5: Applicant Login")
print("-" * 80)
if applicant_email:
    try:
        response = requests.post(
            f"{BASE_URL}/applications/login",
            json={"email": applicant_email, "password": "SecurePass123!"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            applicant_token = data.get("access_token")
            if applicant_token:
                log_pass("Applicant login successful", f"Token received: {applicant_token[:20]}...")
            else:
                log_fail("Applicant login - no token", f"Response: {data}")
        else:
            log_fail("Applicant login failed", f"Status: {response.status_code}, Response: {response.text}")
            applicant_token = None
    except Exception as e:
        log_fail("Applicant login exception", str(e))
        applicant_token = None
else:
    log_fail("Applicant login test skipped", "No applicant email")
    applicant_token = None

print()

# Test 6: My Contract Retrieval
print("Test 6: My Contract Retrieval")
print("-" * 80)
if applicant_token:
    try:
        response = requests.get(
            f"{BASE_URL}/applications/my-contract",
            headers={"Authorization": f"Bearer {applicant_token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            contract = response.json()
            body_html = contract.get("body_html", "")
            
            log_pass("My-contract retrieved successfully", f"Type: {contract.get('type')}")
            
            # Check for MORE Applications GmbH
            if "MORE Applications GmbH" in body_html:
                log_pass("Contract contains 'MORE Applications GmbH'")
            else:
                log_fail("Contract missing 'MORE Applications GmbH'")
            
            # Check for old branding
            old_terms = ["Tdata", "Mariusz", "Ginsheim"]
            found_old = [term for term in old_terms if term in body_html]
            if found_old:
                log_fail("Contract contains old branding", f"Found: {', '.join(found_old)}")
            else:
                log_pass("No old branding in contract")
            
            # Note: Hamburg address and signatory are in the full HTML download, not in my-contract body_html
            # These will be checked in the download test
        else:
            log_fail("My-contract retrieval failed", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_fail("My-contract retrieval exception", str(e))
else:
    log_fail("My-contract test skipped", "No applicant token")

print()

# Test 7: Contract Download (HTML generation check)
print("Test 7: Contract Download (HTML generation)")
print("-" * 80)
if applicant_token and applicant_id:
    try:
        # First, sign the contract to enable download
        # Create a simple signature data
        signature_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        sign_response = requests.post(
            f"{BASE_URL}/applications/sign-contract",
            json={
                "signature_data": signature_data,
                "iban": "DE89370400440532013000"
            },
            headers={"Authorization": f"Bearer {applicant_token}"},
            timeout=10
        )
        
        if sign_response.status_code == 200:
            log_pass("Contract signed successfully")
            
            # Now try to download
            download_response = requests.get(
                f"{BASE_URL}/applications/download-contract",
                headers={"Authorization": f"Bearer {applicant_token}"},
                timeout=10
            )
            
            if download_response.status_code == 200:
                content = download_response.text
                
                log_pass("Contract download successful")
                
                # Check content for branding
                if "MORE Applications GmbH" in content:
                    log_pass("Downloaded contract contains 'MORE Applications GmbH'")
                else:
                    log_fail("Downloaded contract missing 'MORE Applications GmbH'")
                
                old_terms = ["Tdata", "Mariusz", "Ginsheim"]
                found_old = [term for term in old_terms if term in content]
                if found_old:
                    log_fail("Downloaded contract contains old branding", f"Found: {', '.join(found_old)}")
                else:
                    log_pass("No old branding in downloaded contract")
                
                # Check for Hamburg address in full HTML
                if "Hamburg" in content and "Heinrich-Hertz-Str" in content:
                    log_pass("Downloaded contract contains Hamburg address")
                else:
                    log_fail("Downloaded contract missing Hamburg address")
                
                # Check for Jens Olaf Brändel in full HTML
                if "Jens Olaf Brändel" in content or "Brändel" in content:
                    log_pass("Downloaded contract contains new signatory (Brändel)")
                else:
                    log_fail("Downloaded contract missing new signatory")
            else:
                log_fail("Contract download failed", f"Status: {download_response.status_code}")
        else:
            log_warning("Contract signing failed", f"Status: {sign_response.status_code}, Response: {sign_response.text}")
    except Exception as e:
        log_fail("Contract download exception", str(e))
else:
    log_fail("Contract download test skipped", "No applicant token or ID")

print()

# Summary
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {len(results['passed'])}")
for test in results['passed']:
    print(f"   - {test}")
print()

if results['warnings']:
    print(f"⚠️  WARNINGS: {len(results['warnings'])}")
    for warning in results['warnings']:
        print(f"   - {warning['test']}: {warning['details']}")
    print()

if results['failed']:
    print(f"❌ FAILED: {len(results['failed'])}")
    for failure in results['failed']:
        print(f"   - {failure['test']}: {failure['details']}")
    print()
    print("OVERALL RESULT: FAILED")
else:
    print("OVERALL RESULT: PASSED")

print("=" * 80)
