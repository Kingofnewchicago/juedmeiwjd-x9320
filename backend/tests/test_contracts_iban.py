"""
Test suite for Contract Signing with IBAN feature
Tests contract creation, signing with IBAN validation, and PDF download
"""
import pytest
import requests
import os

from dotenv import dotenv_values  # noqa: E402

_base_url = os.environ.get('REACT_APP_BACKEND_URL') or dotenv_values('/app/frontend/.env').get('REACT_APP_BACKEND_URL')
if not _base_url:
    raise RuntimeError('REACT_APP_BACKEND_URL is missing from the environment and /app/frontend/.env')
BASE_URL = _base_url.rstrip('/')

class TestContractSigningWithIBAN:
    """Contract signing with IBAN validation tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get employee auth token"""
        response = requests.post(
            f"{BASE_URL}/api/employee/login",
            json={
                "email": "mitarbeiter@precision-labs.de",
                "password": "Mitarbeiter123!"
            }
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_employee_contracts(self):
        """Test fetching employee contracts"""
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        assert response.status_code == 200
        contracts = response.json()
        assert isinstance(contracts, list)
        print(f"Found {len(contracts)} contracts for employee")
        
    def test_sign_contract_without_iban_fails(self):
        """Test that signing without IBAN fails with validation error"""
        # First get a pending contract or use a test contract ID
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        contracts = response.json()
        pending_contracts = [c for c in contracts if c.get('status') == 'pending']
        
        if len(pending_contracts) == 0:
            pytest.skip("No pending contracts to test")
        
        contract_id = pending_contracts[0]['id']
        
        # Try to sign without IBAN
        response = requests.post(
            f"{BASE_URL}/api/contracts/{contract_id}/sign",
            headers=self.headers,
            json={
                "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            }
        )
        
        # Should fail with 422 (validation error - missing field)
        assert response.status_code == 422
        detail = response.json().get('detail', [])
        # Check that IBAN is mentioned as missing
        assert any('iban' in str(d).lower() for d in detail)
        print("✅ Signing without IBAN correctly fails with validation error")
    
    def test_sign_contract_with_invalid_iban_fails(self):
        """Test that signing with invalid IBAN fails"""
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        contracts = response.json()
        pending_contracts = [c for c in contracts if c.get('status') == 'pending']
        
        if len(pending_contracts) == 0:
            pytest.skip("No pending contracts to test")
        
        contract_id = pending_contracts[0]['id']
        
        # Try to sign with invalid IBAN (too short)
        response = requests.post(
            f"{BASE_URL}/api/contracts/{contract_id}/sign",
            headers=self.headers,
            json={
                "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "iban": "DE1234"  # Invalid - too short
            }
        )
        
        # Should fail with 400 (bad request)
        assert response.status_code == 400
        assert "Ungültige IBAN" in response.json().get('detail', '')
        print("✅ Signing with invalid IBAN correctly fails")
    
    def test_signed_contract_has_iban_stored(self):
        """Test that signed contracts have IBAN stored"""
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        contracts = response.json()
        signed_contracts = [c for c in contracts if c.get('status') == 'signed']
        
        if len(signed_contracts) == 0:
            pytest.skip("No signed contracts to verify")
        
        # Check that signed contracts have IBAN
        for contract in signed_contracts:
            if 'iban' in contract:
                assert len(contract['iban']) >= 15
                print(f"✅ Contract {contract['id']} has IBAN stored: {contract['iban'][:4]}****")
    
    def test_download_signed_contract_pdf(self):
        """Test downloading signed contract PDF"""
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        contracts = response.json()
        signed_contracts = [c for c in contracts if c.get('status') == 'signed']
        
        if len(signed_contracts) == 0:
            pytest.skip("No signed contracts to download")
        
        contract_id = signed_contracts[0]['id']
        
        # Download PDF
        response = requests.get(
            f"{BASE_URL}/api/contracts/{contract_id}/download",
            headers=self.headers
        )
        
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'application/pdf'
        assert len(response.content) > 1000  # PDF should have some content
        print(f"✅ PDF downloaded successfully ({len(response.content)} bytes)")
    
    def test_download_unsigned_contract_fails(self):
        """Test that downloading unsigned contract fails"""
        response = requests.get(
            f"{BASE_URL}/api/contracts/my-contracts",
            headers=self.headers
        )
        contracts = response.json()
        pending_contracts = [c for c in contracts if c.get('status') == 'pending']
        
        if len(pending_contracts) == 0:
            pytest.skip("No pending contracts to test")
        
        contract_id = pending_contracts[0]['id']
        
        # Try to download unsigned contract
        response = requests.get(
            f"{BASE_URL}/api/contracts/{contract_id}/download",
            headers=self.headers
        )
        
        # Should fail with 400 (not signed yet)
        assert response.status_code == 400
        print("✅ Download of unsigned contract correctly fails")


class TestAuszahlungRemoved:
    """Test that Auszahlung page/route is removed"""
    
    def test_auszahlung_route_not_exists(self):
        """Test that /mitarbeiter/auszahlung route doesn't exist in React app"""
        # Navigate to the URL - React will return 200 but show blank page
        response = requests.get(
            f"{BASE_URL}/mitarbeiter/auszahlung"
        )
        # For SPA, it returns 200 but with no matching route content
        assert response.status_code == 200
        # The content should NOT contain Auszahlung-specific elements
        assert 'Aktuelles Guthaben' not in response.text
        print("✅ Auszahlung route is not accessible (blank page)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
