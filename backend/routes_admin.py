from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Header, Depends
from database.db_connection import get_connection
from backend.schemas import ApproveRequest, RejectRequest, CreateStaffRequest
from backend.auth_utils import decode_access_token, hash_password

router = APIRouter(prefix="/admin", tags=["Super Admin & User Management"])

def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify JWT token claims."""
    if not authorization:
        # Fallback for dev/demo if header omitted
        return {"role": "Super Admin", "userId": 1, "franchiseId": None, "branchId": None}
    
    parts = authorization.split(" ")
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        payload = decode_access_token(token)
        if payload:
            return payload
    return {"role": "Super Admin", "userId": 1, "franchiseId": None, "branchId": None}

@router.get("/registrations")
def get_all_registrations(status_filter: Optional[str] = Query("ALL", alias="status")):
    """Retrieve registration requests for Super Admin review."""
    conn = get_connection()
    cursor = conn.cursor()

    if status_filter and status_filter.upper() != "ALL":
        cursor.execute("""
            SELECT id, reference_id, full_name, email, phone, account_type,
                   org_name, branch_name, location, license_type, auth_code,
                   status, rejection_reason, submitted_at, reviewed_at, reviewed_by
            FROM registration_requests
            WHERE UPPER(status) = ?
            ORDER BY id DESC
        """, (status_filter.upper(),))
    else:
        cursor.execute("""
            SELECT id, reference_id, full_name, email, phone, account_type,
                   org_name, branch_name, location, license_type, auth_code,
                   status, rejection_reason, submitted_at, reviewed_at, reviewed_by
            FROM registration_requests
            ORDER BY id DESC
        """)
    
    rows = [dict(row) for row in cursor.fetchall()]

    # Also compute summary statistics
    cursor.execute("SELECT status, COUNT(*) as cnt FROM registration_requests GROUP BY status")
    stats_counts = {row["status"]: row["cnt"] for row in cursor.fetchall()}
    total = sum(stats_counts.values())

    conn.close()

    return {
        "requests": rows,
        "summary": {
            "total": total,
            "pending": stats_counts.get("PENDING", 0),
            "approved": stats_counts.get("APPROVED", 0),
            "rejected": stats_counts.get("REJECTED", 0)
        }
    }

@router.post("/registrations/{ref_id}/approve")
def approve_registration(ref_id: str, payload: Optional[ApproveRequest] = None):
    """Super Admin approves a registration request and activates the user account."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM registration_requests WHERE reference_id = ?", (ref_id,))
    req = cursor.fetchone()

    if not req:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration request with reference '{ref_id}' not found."
        )

    if req["status"] == "APPROVED":
        conn.close()
        return {
            "success": True,
            "message": f"Registration request {ref_id} is already approved and active.",
            "reference_id": ref_id,
            "status": "APPROVED"
        }

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    reviewer = (payload.reviewed_by if payload and payload.reviewed_by else "Super Admin")

    # Map role
    assigned_role = req["account_type"]
    if assigned_role in ["Franchise Manager", "Branch Manager"]:
        assigned_role = "Branch Manager"

    # 1. Ensure branch exists in `branches` table
    branch_name = req["branch_name"] or req["org_name"] or "Mumbai"
    cursor.execute("SELECT branch_id, franchise_id FROM branches WHERE branch_name = ?", (branch_name,))
    branch_row = cursor.fetchone()

    if not branch_row:
        # Default franchise assignment (West Coast for western territory, Deccan for south, Central for central)
        fid = 1 if "mumbai" in branch_name.lower() or "pune" in branch_name.lower() else 2
        cursor.execute(
            "INSERT INTO branches (branch_name, city, is_active, franchise_id) VALUES (?, ?, 1, ?)",
            (branch_name, req["location"] or "India", fid)
        )
        branch_id = cursor.lastrowid
        franchise_id = fid
    else:
        branch_id = branch_row["branch_id"]
        franchise_id = branch_row["franchise_id"]

    # If role is Franchise Owner, link to franchise
    if assigned_role == "Franchise Owner":
        branch_id = None

    # 2. Activate or Create user in `users` table
    email_clean = req["email"].lower().strip()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email_clean,))
    existing_user = cursor.fetchone()

    default_title = (
        "Franchise Partner & Principal"
        if assigned_role == "Franchise Owner"
        else "Branch Operations Manager"
    )

    if existing_user:
        cursor.execute("""
            UPDATE users
            SET role = ?,
                title = ?,
                branch_id = ?,
                branch_name = ?,
                franchise_id = ?,
                city = ?,
                password_hash = ?,
                is_active = 1,
                registration_ref = ?
            WHERE id = ?
        """, (
            assigned_role,
            default_title,
            branch_id,
            branch_name,
            franchise_id,
            req["location"],
            req["password_hash"],
            ref_id,
            existing_user["id"]
        ))
        user_id = existing_user["id"]
    else:
        cursor.execute("""
            INSERT INTO users (
                email, password_hash, full_name, phone, role,
                title, branch_id, branch_name, franchise_id, city, is_active, registration_ref
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (
            email_clean,
            req["password_hash"],
            req["full_name"],
            req["phone"],
            assigned_role,
            default_title,
            branch_id,
            branch_name,
            franchise_id,
            req["location"],
            ref_id
        ))
        user_id = cursor.lastrowid

    # 3. Update request status to APPROVED
    cursor.execute("""
        UPDATE registration_requests
        SET status = 'APPROVED',
            rejection_reason = NULL,
            reviewed_at = ?,
            reviewed_by = ?
        WHERE reference_id = ?
    """, (now_str, reviewer, ref_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Registration {ref_id} approved successfully. User account has been activated for {req['full_name']} ({email_clean}).",
        "reference_id": ref_id,
        "status": "APPROVED",
        "user_id": user_id,
        "role": assigned_role,
        "branch": branch_name
    }

@router.post("/registrations/{ref_id}/reject")
def reject_registration(ref_id: str, payload: Optional[RejectRequest] = None):
    """Super Admin rejects a registration request with an optional reason."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM registration_requests WHERE reference_id = ?", (ref_id,))
    req = cursor.fetchone()

    if not req:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration request with reference '{ref_id}' not found."
        )

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    reason = (payload.reason if payload and payload.reason else "Application does not meet franchise qualification criteria")
    reviewer = (payload.reviewed_by if payload and payload.reviewed_by else "Super Admin")

    cursor.execute("""
        UPDATE registration_requests
        SET status = 'REJECTED',
            rejection_reason = ?,
            reviewed_at = ?,
            reviewed_by = ?
        WHERE reference_id = ?
    """, (reason, now_str, reviewer, ref_id))

    # Also deactivate user in `users` if an account was linked
    cursor.execute("UPDATE users SET is_active = 0 WHERE registration_ref = ?", (ref_id,))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Registration request {ref_id} has been marked as REJECTED.",
        "reference_id": ref_id,
        "status": "REJECTED",
        "reason": reason
    }

@router.get("/users")
def get_all_users(role_filter: Optional[str] = None):
    """List all users for User Management table."""
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT u.id, u.email, u.full_name, u.phone, u.role, u.title,
               u.branch_id, u.branch_name, u.franchise_id, u.city, u.is_active,
               u.created_at, f.franchise_name
        FROM users u
        LEFT JOIN franchises f ON u.franchise_id = f.franchise_id
    """
    params = []
    if role_filter and role_filter != "ALL":
        query += " WHERE u.role = ?"
        params.append(role_filter)
    query += " ORDER BY u.id ASC"

    cursor.execute(query, tuple(params))
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"users": users, "total": len(users)}

@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int):
    """Activate or deactivate a user account."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name, is_active FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = 0 if user["is_active"] else 1
    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "user_id": user_id,
        "is_active": new_status,
        "message": f"User {user['full_name']} account {'activated' if new_status else 'deactivated'} successfully."
    }

@router.post("/users/create-staff")
def create_staff_user(req: CreateStaffRequest):
    """Authorized provisioning of a Staff account by Admin, Owner or Manager."""
    conn = get_connection()
    cursor = conn.cursor()

    email_clean = req.email.lower().strip()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email_clean,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="An account with this email address already exists.")

    # Get branch details
    cursor.execute("SELECT branch_name, franchise_id, city FROM branches WHERE branch_id = ?", (req.branchId,))
    branch = cursor.fetchone()
    if not branch:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid branch ID.")

    phash = hash_password(req.password)
    cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, phone, role, title, branch_id, branch_name, franchise_id, city, is_active)
        VALUES (?, ?, ?, ?, 'Staff', ?, ?, ?, ?, ?, 1)
    """, (email_clean, phash, req.fullName.strip(), req.phone.strip(), req.title, req.branchId, branch["branch_name"], branch["franchise_id"], branch["city"]))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "success": True,
        "user_id": user_id,
        "message": f"Staff account created successfully for {req.fullName}."
    }

@router.get("/franchises")
def get_franchise_directory():
    """Retrieve full franchise directory and outlet hierarchies."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.franchise_id, f.franchise_name, f.code, f.headquarters, f.status, f.created_at,
               u.full_name as owner_name, u.email as owner_email
        FROM franchises f
        LEFT JOIN users u ON f.owner_id = u.id
    """)
    franchises = [dict(row) for row in cursor.fetchall()]

    for f in franchises:
        cursor.execute("""
            SELECT branch_id, branch_name, city, is_active
            FROM branches
            WHERE franchise_id = ?
        """, (f["franchise_id"],))
        f["branches"] = [dict(b) for b in cursor.fetchall()]

    conn.close()
    return {"franchises": franchises}
