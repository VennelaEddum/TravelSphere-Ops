import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from starlette.testclient import TestClient
from backend.server import app
from database.db_connection import get_connection

def run_tests():
    # Clean up test accounts
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE email IN ('pooja.mgr@travelsphere.test', 'vikram.singh@rajasthantours.test')")
    c.execute("DELETE FROM registration_requests WHERE email IN ('pooja.mgr@travelsphere.test', 'vikram.singh@rajasthantours.test')")
    conn.commit()
    conn.close()

    with TestClient(app) as client:
        print("1. Testing Health...")
        res = client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("   Health response:", res.json())

        print("2. Testing Super Admin registration block...")
        res = client.post("/api/v1/auth/register", json={
            "fullName": "Unauthorized Admin",
            "email": "hacker@test.com",
            "phone": "9876543210",
            "accountType": "Super Admin",
            "password": "Password123"
        })
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
        print("   Super Admin registration blocked as expected (403 Forbidden).")

        print("3. Testing Manager registration with invalid invitation code...")
        res = client.post("/api/v1/auth/register", json={
            "fullName": "Pooja Nair",
            "email": "pooja.invalid@test.com",
            "phone": "9820011223",
            "accountType": "Franchise Manager",
            "branchName": "Mumbai",
            "authCode": "BAD-CODE-000",
            "password": "Password123"
        })
        assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
        print("   Invalid invitation code blocked as expected (400 Bad Request).")

        print("4. Testing Valid Franchise Manager registration with INV-MUM-2026...")
        test_email = "pooja.mgr@travelsphere.test"
        res = client.post("/api/v1/auth/register", json={
            "fullName": "Pooja Nair",
            "email": test_email,
            "phone": "9820011223",
            "accountType": "Franchise Manager",
            "branchName": "Mumbai",
            "authCode": "INV-MUM-2026",
            "password": "ManagerPass@2026"
        })
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        reg_data = res.json()
        ref_id = reg_data["referenceId"]
        print(f"   Registration successful! Reference ID: {ref_id}, Status: {reg_data['status']}")

        print("5. Testing Duplicate email prevention...")
        res = client.post("/api/v1/auth/register", json={
            "fullName": "Duplicate User",
            "email": test_email,
            "phone": "9820011223",
            "accountType": "Franchise Manager",
            "branchName": "Mumbai",
            "authCode": "INV-MUM-2026",
            "password": "ManagerPass@2026"
        })
        assert res.status_code == 409, f"Expected 409, got {res.status_code}: {res.text}"
        print("   Duplicate email blocked as expected (409 Conflict).")

        print("6. Testing Login attempt while PENDING approval...")
        res = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "ManagerPass@2026"
        })
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
        print(f"   Pending login blocked as expected (403 Forbidden). Message: {res.json()['detail']}")

        print("7. Testing Super Admin listing registrations...")
        res = client.get("/api/v1/admin/registrations")
        assert res.status_code == 200
        reqs = res.json()["requests"]
        found = any(r["reference_id"] == ref_id for r in reqs)
        assert found, f"Reference ID {ref_id} not found in admin requests"
        print(f"   Super Admin fetched {len(reqs)} registration requests successfully.")

        print("8. Testing Super Admin APPROVAL workflow...")
        res = client.post(f"/api/v1/admin/registrations/{ref_id}/approve", json={
            "reviewed_by": "Rujaal Ghate (Head Office)"
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        print("   Registration approved! Response:", res.json()["message"])

        print("9. Testing Login attempt AFTER approval...")
        res = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "ManagerPass@2026"
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        auth_data = res.json()
        assert "token" in auth_data
        assert auth_data["user"]["role"] in ["Branch Manager", "Franchise Manager"]
        print(f"   Approved login successful! User: {auth_data['user']['name']} ({auth_data['user']['role']})")
        print(f"   JWT token generated successfully (len: {len(auth_data['token'])})")

        print("10. Testing Franchise Owner registration & rejection workflow...")
        owner_email = "vikram.singh@rajasthantours.test"
        res = client.post("/api/v1/auth/register", json={
            "fullName": "Vikram Singh",
            "email": owner_email,
            "phone": "9829012345",
            "accountType": "Franchise Owner",
            "orgName": "Royal Heritage Journeys",
            "branchName": "Jaipur City",
            "location": "Jaipur, Rajasthan",
            "licenseType": "Master Territory Franchise",
            "password": "OwnerSecure@2026"
        })
        assert res.status_code == 201
        owner_ref = res.json()["referenceId"]

        res = client.post(f"/api/v1/admin/registrations/{owner_ref}/reject", json={
            "reason": "Territory documentation incomplete. Please re-apply with tax registration certificate.",
            "reviewed_by": "Super Admin"
        })
        assert res.status_code == 200

        res = client.post("/api/v1/auth/login", json={
            "email": owner_email,
            "password": "OwnerSecure@2026"
        })
        assert res.status_code == 403, f"Expected 403 for rejected user, got {res.status_code}"
        print(f"   Rejection and login blocking verified! Detail: {res.json()['detail']}")

        print("11. Testing Demo accounts backward compatibility...")
        res = client.post("/api/v1/auth/login", json={
            "email": "admin@travelsphere.demo",
            "password": "Admin@123"
        })
        assert res.status_code == 200
        print(f"   Demo account login verified: {res.json()['user']['name']}")

        print("\n=======================================================")
        print("ALL BACKEND REGISTRATION & APPROVAL WORKFLOW TESTS PASSED!")
        print("=======================================================")

if __name__ == "__main__":
    run_tests()
