from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Header, Query
from database.db_connection import get_connection
from backend.auth_utils import decode_access_token
from backend.schemas import ChatRequest, ChatResponse

router = APIRouter(tags=["Data & Operations Intelligence"])

def get_auth_user(authorization: Optional[str] = Header(None)):
    """Authenticate and extract user claims from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in."
        )
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token format."
        )
    token = parts[1]
    
    # Handle demo JWT tokens
    if token.startswith("demo_jwt_token_"):
        if "super_admin" in token:
            return {"userId": 1, "role": "Super Admin", "franchiseId": None, "branchId": None}
        elif "franchise_owner" in token:
            return {"userId": 2, "role": "Franchise Owner", "franchiseId": 1, "branchId": None}
        elif "branch_manager" in token or "franchise_manager" in token:
            return {"userId": 3, "role": "Branch Manager", "franchiseId": 1, "branchId": 1}
        elif "staff" in token:
            return {"userId": 4, "role": "Staff", "franchiseId": 1, "branchId": 1}

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token."
        )
    return payload

@router.get("/workforce/tasks")
def get_workforce_tasks(
    requested_branch_id: Optional[int] = Query(None),
    requested_franchise_id: Optional[int] = Query(None),
    user: dict = Header(None) # will use dependency or direct call
):
    """
    Enforces strict four-level task access:
    - Super Admin: All tasks
    - Franchise Owner: Only tasks belonging to user's franchise_id
    - Branch Manager: Only tasks belonging to user's branch_id
    - Staff: Strictly only tasks assigned to user's userId
    """
    pass

# Helper function to query tasks with strict scoping
def query_scoped_tasks(user_claims: dict, req_branch_id: Optional[int] = None, req_franchise_id: Optional[int] = None):
    role = user_claims.get("role")
    user_id = user_claims.get("userId")
    user_branch_id = user_claims.get("branchId")
    user_franchise_id = user_claims.get("franchiseId")

    conn = get_connection()
    cursor = conn.cursor()

    base_query = """
        SELECT t.task_id, t.title, t.description, t.assigned_to, t.assigned_by,
               t.branch_id, t.franchise_id, t.due_date, t.priority, t.status,
               u.full_name as assignee_name, u.role as assignee_role,
               b.branch_name, f.franchise_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN branches b ON t.branch_id = b.branch_id
        LEFT JOIN franchises f ON t.franchise_id = f.franchise_id
    """

    # 1. Staff Level Isolation: strictly own tasks only
    if role == "Staff":
        cursor.execute(base_query + " WHERE t.assigned_to = ? ORDER BY t.due_date ASC", (user_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, "Personal (Staff Level)"

    # 2. Branch Manager Level Isolation: strictly own branch only
    elif role == "Branch Manager":
        if req_branch_id and req_branch_id != user_branch_id:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Branch Managers are restricted to their assigned branch (Branch #{user_branch_id})."
            )
        cursor.execute(base_query + " WHERE t.branch_id = ? ORDER BY t.due_date ASC", (user_branch_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, f"Branch Level (Branch #{user_branch_id})"

    # 3. Franchise Owner Level Isolation: strictly own franchise only
    elif role == "Franchise Owner":
        if req_franchise_id and req_franchise_id != user_franchise_id:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Franchise Owners cannot access tasks outside their franchise (Franchise #{user_franchise_id})."
            )
        cursor.execute(base_query + " WHERE t.franchise_id = ? ORDER BY t.due_date ASC", (user_franchise_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, f"Franchise Level (Franchise #{user_franchise_id})"

    # 4. Super Admin Level: Network-wide
    elif role == "Super Admin":
        query = base_query
        params = []
        if req_branch_id:
            query += " WHERE t.branch_id = ?"
            params.append(req_branch_id)
        elif req_franchise_id:
            query += " WHERE t.franchise_id = ?"
            params.append(req_franchise_id)
        query += " ORDER BY t.due_date ASC"
        cursor.execute(query, tuple(params))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, "Global Network (Super Admin)"

    conn.close()
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role.")

@router.get("/workforce/tasks")
def get_tasks(
    requested_branch_id: Optional[int] = Query(None),
    requested_franchise_id: Optional[int] = Query(None),
    authorization: Optional[str] = Header(None)
):
    user = get_auth_user(authorization)
    records, scope = query_scoped_tasks(user, requested_branch_id, requested_franchise_id)
    return {
        "tasks": records,
        "count": len(records),
        "data_scope": scope,
        "authorized_role": user.get("role")
    }

# Helper function to query bookings with strict scoping
def query_scoped_bookings(user_claims: dict, req_branch_id: Optional[int] = None, req_franchise_id: Optional[int] = None):
    role = user_claims.get("role")
    user_id = user_claims.get("userId")
    user_branch_id = user_claims.get("branchId")
    user_franchise_id = user_claims.get("franchiseId")

    conn = get_connection()
    cursor = conn.cursor()

    base_query = """
        SELECT bk.booking_id, bk.booking_reference, bk.customer_name, bk.package_name,
               bk.branch_id, bk.franchise_id, bk.assigned_staff_id, bk.travel_date,
               bk.pax, bk.amount, bk.status, b.branch_name, f.franchise_name,
               u.full_name as assigned_staff_name
        FROM bookings bk
        LEFT JOIN branches b ON bk.branch_id = b.branch_id
        LEFT JOIN franchises f ON bk.franchise_id = f.franchise_id
        LEFT JOIN users u ON bk.assigned_staff_id = u.id
    """

    # 1. Staff Level Isolation: strictly assigned bookings
    if role == "Staff":
        cursor.execute(base_query + " WHERE bk.assigned_staff_id = ? ORDER BY bk.travel_date ASC", (user_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, "Personal (Staff Level)"

    # 2. Branch Manager Level Isolation: strictly own branch
    elif role == "Branch Manager":
        if req_branch_id and req_branch_id != user_branch_id:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Cannot view bookings outside your assigned branch ({user_branch_id})."
            )
        cursor.execute(base_query + " WHERE bk.branch_id = ? ORDER BY bk.travel_date ASC", (user_branch_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, f"Branch Level (Branch #{user_branch_id})"

    # 3. Franchise Owner Level Isolation: strictly own franchise
    elif role == "Franchise Owner":
        if req_franchise_id and req_franchise_id != user_franchise_id:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Cannot view bookings outside your franchise ({user_franchise_id})."
            )
        cursor.execute(base_query + " WHERE bk.franchise_id = ? ORDER BY bk.travel_date ASC", (user_franchise_id,))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, f"Franchise Level (Franchise #{user_franchise_id})"

    # 4. Super Admin Level: Network-wide
    elif role == "Super Admin":
        query = base_query
        params = []
        if req_branch_id:
            query += " WHERE bk.branch_id = ?"
            params.append(req_branch_id)
        elif req_franchise_id:
            query += " WHERE bk.franchise_id = ?"
            params.append(req_franchise_id)
        query += " ORDER BY bk.travel_date ASC"
        cursor.execute(query, tuple(params))
        records = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return records, "Global Network (Super Admin)"

    conn.close()
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role.")

@router.get("/bookings")
def get_bookings(
    requested_branch_id: Optional[int] = Query(None),
    requested_franchise_id: Optional[int] = Query(None),
    authorization: Optional[str] = Header(None)
):
    user = get_auth_user(authorization)
    records, scope = query_scoped_bookings(user, requested_branch_id, requested_franchise_id)
    return {
        "bookings": records,
        "count": len(records),
        "data_scope": scope,
        "authorized_role": user.get("role")
    }

# ==============================================================================
# TRAVELSPHERE AI ASSISTANT ENDPOINT (ROLE-AWARE INTELLIGENCE)
# ==============================================================================
@router.post("/assistant/chat", response_model=ChatResponse)
def assistant_chat(req: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    Role-aware TravelSphere AI Assistant:
    Retrieves information strictly bounded by the user's role and data scope.
    """
    user = get_auth_user(authorization)
    role = user.get("role")
    user_id = user.get("userId")
    branch_id = user.get("branchId")
    franchise_id = user.get("franchiseId")
    query = req.message.lower().strip()

    conn = get_connection()
    cursor = conn.cursor()

    if role == "Super Admin":
        # Global Network queries
        cursor.execute("SELECT COUNT(*) as branches, SUM(revenue) as rev, SUM(bookings) as bks FROM performance_records")
        perf = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) as cnt FROM registration_requests WHERE status = 'PENDING'")
        pending_regs = cursor.fetchone()["cnt"]
        conn.close()

        reply = (
            f"**[TravelSphere Ops AI - Global Network Scope]**\n\n"
            f"Hello Administrator. Network operations summary across all franchises:\n"
            f"• **Active Branches**: 5 regional hubs (Mumbai, Pune, Hyderabad, Nagpur, Bengaluru)\n"
            f"• **Network Revenue**: ₹{perf['rev']:,.2f} with {perf['bks']} total bookings logged\n"
            f"• **Registration Authorizations**: {pending_regs} pending franchise partner application(s) awaiting review in Franchise Intelligence\n"
            f"• **Top Performing Outlet**: Bengaluru (112.5% target achievement)\n\n"
            f"I have full visibility into all franchise territories, audit compliance records, and consolidated booking streams."
        )
        return ChatResponse(
            reply=reply,
            data_scope="Global Network (Super Admin)",
            authorized_role=role,
            records_accessed=5,
            is_demo=True
        )

    elif role == "Franchise Owner":
        # Franchise-level queries (own branches: Mumbai & Pune)
        cursor.execute("""
            SELECT b.branch_name, pr.revenue, pr.target, pr.bookings, pr.cancellations
            FROM performance_records pr
            JOIN branches b ON pr.branch_id = b.branch_id
            WHERE b.franchise_id = ?
            ORDER BY pr.record_date DESC LIMIT 5
        """, (franchise_id or 1,))
        records = cursor.fetchall()
        conn.close()

        reply = (
            f"**[TravelSphere Ops AI - Franchise Territory Scope]**\n\n"
            f"Welcome Principal Vennela Eddum. Territory report for **West Coast Tourism Holdings**:\n"
            f"• **Governed Branches**: Mumbai Hub (Branch #1) and Pune Gateway (Branch #2)\n"
            f"• **Franchise Performance**: Mumbai is operating at 104.2% of target revenue; Pune is at 91.8%.\n"
            f"• **Workforce Tasks**: 3 pending operational tasks across your branch personnel.\n"
            f"• **Territorial Compliance**: Franchise license active through 2028.\n\n"
            f"*(Notice: Other franchise holdings such as Deccan Travel Enterprises are restricted from this view under strict franchise isolation policy.)*"
        )
        return ChatResponse(
            reply=reply,
            data_scope="Franchise Level (West Coast Holdings)",
            authorized_role=role,
            records_accessed=len(records),
            is_demo=True
        )

    elif role == "Branch Manager":
        # Branch-level queries (Mumbai only)
        cursor.execute("""
            SELECT COUNT(*) as bks, SUM(amount) as rev 
            FROM bookings 
            WHERE branch_id = ?
        """, (branch_id or 1,))
        bks_stat = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as tcnt FROM tasks WHERE branch_id = ?", (branch_id or 1,))
        tcnt = cursor.fetchone()["tcnt"]
        conn.close()

        reply = (
            f"**[TravelSphere Ops AI - Branch Operations Scope]**\n\n"
            f"Hello Manager Utkarsh. Operational snapshot for **Mumbai Branch**:\n"
            f"• **Assigned Bookings**: {bks_stat['bks']} active branch bookings totaling ₹{bks_stat['rev']:,.2f}\n"
            f"• **Branch Tasks**: {tcnt} active team tasks scheduled for execution\n"
            f"• **Tour Fleet Status**: Coastal bus service reconfirmed for Goa Explorer\n"
            f"• **Next Milestone**: Conduct weekly ground safety briefing with tour consultants\n\n"
            f"*(Notice: Strategic franchise finances and other branch cities are restricted from your operations view.)*"
        )
        return ChatResponse(
            reply=reply,
            data_scope="Branch Operations (Mumbai)",
            authorized_role=role,
            records_accessed=bks_stat['bks'],
            is_demo=True
        )

    elif role == "Staff":
        # Staff-level queries (personal assignments only)
        cursor.execute("SELECT COUNT(*) as cnt FROM tasks WHERE assigned_to = ?", (user_id or 4,))
        tcount = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM bookings WHERE assigned_staff_id = ?", (user_id or 4,))
        bcount = cursor.fetchone()["cnt"]
        conn.close()

        reply = (
            f"**[TravelSphere Ops AI - Personal Staff Scope]**\n\n"
            f"Hello Sneha. Here is your personalized daily work briefing:\n"
            f"• **Your Assigned Tasks**: {tcount} pending tasks (Next: *Verify Visa Documents for Swiss Alps Tour* by Nov 22)\n"
            f"• **Your Bookings**: {bcount} passenger itineraries in your portfolio\n"
            f"• **Client Follow-ups**: Follow up with Kerala Backwaters warm leads from weekend campaign\n"
            f"• **Today's Shift**: 09:30 AM - 06:30 PM (Attendance status: Logged In)\n\n"
            f"*(Notice: In accordance with our personal privacy policy, other employees' records and branch revenue metrics are hidden.)*"
        )
        return ChatResponse(
            reply=reply,
            data_scope="Personal (Staff Level)",
            authorized_role=role,
            records_accessed=tcount + bcount,
            is_demo=True
        )

    conn.close()
    return ChatResponse(
        reply="Hello! I am your TravelSphere Ops Intelligent Assistant. How can I assist you with your operations today?",
        data_scope="Standard Scope",
        authorized_role=role or "Guest",
        is_demo=True
    )
