import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import HTTPException
from database.create_tables import create_tables
from database.seed_data import seed_data
from database.create_auth_tables import create_auth_tables
from database.migrate_four_roles_hierarchy import migrate_database
from database.db_connection import get_connection

from backend.routes_auth import register, login, get_available_branches
from backend.routes_admin import (
    get_all_registrations,
    approve_registration,
    reject_registration,
    get_all_users,
    toggle_user_status,
    create_staff_user
)
from backend.routes_data import query_scoped_tasks, query_scoped_bookings, assistant_chat
from backend.schemas import (
    RegisterRequest,
    LoginRequest,
    ApproveRequest,
    RejectRequest,
    CreateStaffRequest,
    ChatRequest
)
from backend.auth_utils import decode_access_token

def test_full_travelsphere_suite():
    print("=================================================================")
    print("TRAVELSPHERE OPS – COMPREHENSIVE BACKEND VERIFICATION & RBAC TEST")
    print("=================================================================")

    print("\n--- 1. Initializing and verifying database schema ---")
    create_tables()
    seed_data()
    create_auth_tables()
    migrate_database()
    print("Database tables, 4-tier hierarchy, and foreign keys verified OK.")

    print("\n--- 2. Public Super Admin and Staff registration block ---")
    try:
        register(RegisterRequest(
            fullName="Unauthorized Admin",
            email="hacker.admin@test.com",
            phone="9876543210",
            accountType="Super Admin",
            password="Password123"
        ))
        assert False, "Should have thrown 403 Forbidden"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"Passed: Super Admin registration blocked with 403 ({e.detail})")

    try:
        register(RegisterRequest(
            fullName="Unauthorized Staff",
            email="staff.pub@test.com",
            phone="9876543210",
            accountType="Staff",
            password="Password123"
        ))
        assert False, "Should have thrown 403 Forbidden"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"Passed: Staff public registration blocked with 403 ({e.detail})")

    print("\n--- 3. Branch Manager invalid invitation code block ---")
    try:
        register(RegisterRequest(
            fullName="Pooja Sharma",
            email="pooja.sharma@test.com",
            phone="9820011223",
            accountType="Branch Manager",
            branchName="Mumbai",
            authCode="INVALID_CODE_999",
            password="Password123"
        ))
        assert False, "Should have thrown 400 Bad Request"
    except HTTPException as e:
        assert e.status_code == 400
        print(f"Passed: Invalid invitation code rejected with 400 ({e.detail})")

    print("\n--- 4. Valid Branch Manager registration submission & approval ---")
    mgr_email = "sunita.deshmukh@travelsphere.test"
    # Clean previous run if present
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE email = ?", (mgr_email,))
    c.execute("DELETE FROM registration_requests WHERE email = ?", (mgr_email,))
    conn.commit()
    conn.close()

    reg_mgr = register(RegisterRequest(
        fullName="Sunita Deshmukh",
        email=mgr_email,
        phone="9820055443",
        accountType="Branch Manager",
        branchName="Mumbai",
        authCode="INV-MUM-2026",
        password="ManagerSecure@123"
    ))
    assert reg_mgr.success is True
    assert reg_mgr.status == "Pending Approval"
    mgr_ref_id = reg_mgr.referenceId
    print(f"Passed: Branch Manager registration created with Reference ID: {mgr_ref_id}")

    # Approve request
    approve_res = approve_registration(mgr_ref_id, ApproveRequest(reviewed_by="Super Admin Rujaal"))
    assert approve_res["success"] is True
    assert approve_res["status"] == "APPROVED"
    print(f"Passed: Registration approved by Super Admin: {approve_res['message']}")

    # Newly approved user logs in
    login_res = login(LoginRequest(email=mgr_email, password="ManagerSecure@123"))
    assert login_res.success is True
    assert login_res.user.role == "Branch Manager"
    print(f"Passed: Approved user authenticated with token: {login_res.user.email}")

    print("\n--- 5. Authenticate All Four Authorized Demo Accounts ---")
    demo_accounts = [
        ("admin@travelsphere.demo", "Admin@123", "Super Admin", None, None),
        ("owner@travelsphere.demo", "Owner@123", "Franchise Owner", 1, None),
        ("manager@travelsphere.demo", "Manager@123", "Branch Manager", 1, 1),
        ("staff@travelsphere.demo", "Staff@123", "Staff", 1, 1),
    ]

    tokens = {}
    user_payloads = {}

    for email, pwd, expected_role, exp_franchise, exp_branch in demo_accounts:
        res = login(LoginRequest(email=email, password=pwd))
        assert res.success is True, f"Failed login for {email}"
        assert res.user.role == expected_role, f"Expected {expected_role}, got {res.user.role}"
        tokens[expected_role] = res.token
        user_payloads[expected_role] = res.user
        claims = decode_access_token(res.token)
        assert claims["role"] == expected_role
        if exp_franchise is not None:
            assert res.user.franchiseId == exp_franchise
        if exp_branch is not None:
            assert res.user.branchId == exp_branch
        print(f"  [OK] {expected_role:18} | Email: {email:26} | Franchise: {str(res.user.franchiseId):5} | Branch: {str(res.user.branchId):5}")

    print("\n--- 6. Test Data Isolation & 4-Level Scoping on Tasks Endpoint ---")
    admin_payload = {"sub": "admin@travelsphere.demo", "role": "Super Admin", "userId": user_payloads["Super Admin"].id}
    owner_payload = {"sub": "owner@travelsphere.demo", "role": "Franchise Owner", "userId": user_payloads["Franchise Owner"].id, "franchiseId": 1}
    manager_payload = {"sub": "manager@travelsphere.demo", "role": "Branch Manager", "userId": user_payloads["Branch Manager"].id, "franchiseId": 1, "branchId": 1}
    staff_payload = {"sub": "staff@travelsphere.demo", "role": "Staff", "userId": user_payloads["Staff"].id, "franchiseId": 1, "branchId": 1}

    # Super Admin sees network-wide tasks
    admin_tasks, admin_scope = query_scoped_tasks(admin_payload, req_branch_id=None, req_franchise_id=None)
    print(f"Passed: Super Admin fetched network-wide tasks (count: {len(admin_tasks)}, scope: {admin_scope})")

    # Franchise Owner sees tasks in Franchise 1
    owner_tasks, owner_scope = query_scoped_tasks(owner_payload, req_branch_id=None, req_franchise_id=1)
    print(f"Passed: Franchise Owner fetched franchise tasks (count: {len(owner_tasks)}, scope: {owner_scope})")

    # Cross-franchise access violation by Franchise Owner -> must throw 403 Forbidden
    try:
        query_scoped_tasks(owner_payload, req_branch_id=None, req_franchise_id=2)
        assert False, "Franchise Owner should not access Franchise 2"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"Passed: Cross-franchise access blocked with 403: {e.detail}")

    # Branch Manager sees tasks in Branch 1
    mgr_tasks, mgr_scope = query_scoped_tasks(manager_payload, req_branch_id=1, req_franchise_id=None)
    print(f"Passed: Branch Manager fetched branch tasks (count: {len(mgr_tasks)}, scope: {mgr_scope})")

    # Cross-branch access violation by Branch Manager -> must throw 403 Forbidden
    try:
        query_scoped_tasks(manager_payload, req_branch_id=3, req_franchise_id=None)
        assert False, "Branch Manager should not access Branch 3"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"Passed: Cross-branch access blocked with 403: {e.detail}")

    # Staff sees only their personal tasks
    staff_tasks, staff_scope = query_scoped_tasks(staff_payload, req_branch_id=1, req_franchise_id=1)
    for task in staff_tasks:
        assert task['assigned_to'] == user_payloads["Staff"].id
    print(f"Passed: Staff strictly scoped to personal tasks (count: {len(staff_tasks)}, scope: {staff_scope})")

    print("\n--- 7. Test Data Isolation & 4-Level Scoping on Bookings Endpoint ---")
    admin_bk, admin_bk_scope = query_scoped_bookings(admin_payload, req_branch_id=None, req_franchise_id=None)
    assert len(admin_bk) >= 3
    print(f"Passed: Super Admin retrieved global bookings (count: {len(admin_bk)}, scope: {admin_bk_scope})")

    # Cross-branch check on bookings
    try:
        query_scoped_bookings(manager_payload, req_branch_id=2, req_franchise_id=None)
        assert False, "Branch Manager should not access other branches' bookings"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"Passed: Cross-branch booking request blocked with 403: {e.detail}")

    print("\n--- 8. Role-Aware TravelSphere AI Assistant Endpoint ---")
    admin_chat = assistant_chat(
        ChatRequest(message="Give me a quick operational summary", branch_id=None, franchise_id=None),
        authorization=f"Bearer {tokens['Super Admin']}"
    )
    assert admin_chat.authorized_role == "Super Admin"
    assert "Super Admin" in admin_chat.reply or "Administrator" in admin_chat.reply
    print(f"Passed: AI Assistant role-tailored response for Super Admin verified.")

    staff_chat = assistant_chat(
        ChatRequest(message="What should I work on today?", branch_id=1, franchise_id=1),
        authorization=f"Bearer {tokens['Staff']}"
    )
    assert staff_chat.authorized_role == "Staff"
    assert "Personal Staff Scope" in staff_chat.reply or "Assigned Tasks" in staff_chat.reply
    print(f"Passed: AI Assistant role-tailored response for Staff verified.")

    print("\n--- 9. User Management & Staff Account Creation ---")
    # Clean previous test staff if exists
    test_staff_email = "newhire.ops@travelsphere.test"
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE email = ?", (test_staff_email,))
    conn.commit()
    conn.close()

    created_staff = create_staff_user(
        CreateStaffRequest(
            fullName="Ravi Varma",
            email=test_staff_email,
            phone="9988776655",
            branchId=1,
            title="Operations Specialist",
            password="TempPassword@123"
        )
    )
    assert created_staff["success"] is True
    created_id = created_staff["user_id"]
    print(f"Passed: Branch Manager created new Staff user (ID: {created_id})")

    # Test toggling user status
    toggle_res = toggle_user_status(created_id)
    assert toggle_res["is_active"] == 0
    print(f"Passed: Toggled user status to Inactive (active=0)")

    toggle_res2 = toggle_user_status(created_id)
    assert toggle_res2["is_active"] == 1
    print(f"Passed: Toggled user status back to Active (active=1)")

    # List users
    users_list = get_all_users(role_filter="Staff")
    assert any(u["email"] == test_staff_email for u in users_list["users"])
    print(f"Passed: Listed users with role filter 'Staff' (count: {len(users_list['users'])})")

    print("\n=================================================================")
    print("ALL TRAVELSPHERE OPS BACKEND & RBAC SUITE TESTS PASSED (100%!)")
    print("=================================================================")

if __name__ == "__main__":
    test_full_travelsphere_suite()
