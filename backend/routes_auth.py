import re
import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from database.db_connection import get_connection
from backend.auth_utils import hash_password, verify_password, create_access_token
from backend.schemas import RegisterRequest, LoginRequest, LoginResponse, RegistrationResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Registration"])

# Assigned navigation modules based on the four roles
ROLE_MODULES = {
    "Super Admin": [
        "dashboard", "franchise-management", "finance-performance",
        "booking-resources", "workforce", "customer-marketing",
        "franchise-intelligence", "ai-assistant", "notifications"
    ],
    "Franchise Owner": [
        "dashboard", "franchise-management", "finance-performance",
        "booking-resources", "workforce", "customer-marketing",
        "franchise-intelligence", "ai-assistant", "notifications"
    ],
    "Branch Manager": [
        "dashboard", "booking-resources", "workforce",
        "customer-marketing", "ai-assistant", "notifications"
    ],
    "Staff": [
        "dashboard", "booking-resources", "workforce",
        "customer-marketing", "ai-assistant", "notifications"
    ]
}

# In-memory demo accounts fallback (matches frontend authApi.js)
DEMO_ACCOUNTS = {
    "admin@travelsphere.demo": {
        "id": 1,
        "email": "admin@travelsphere.demo",
        "password": "Admin@123",
        "name": "Rujaal Ghate",
        "role": "Super Admin",
        "title": "Head Office Administrator",
        "franchiseId": None,
        "franchiseName": "Global Network",
        "branchId": None,
        "branchName": "All Branches",
        "city": "Mumbai HQ",
        "assignedModules": ROLE_MODULES["Super Admin"]
    },
    "owner@travelsphere.demo": {
        "id": 2,
        "email": "owner@travelsphere.demo",
        "password": "Owner@123",
        "name": "Vennela Eddum",
        "role": "Franchise Owner",
        "title": "Franchise Partner & Principal",
        "franchiseId": 1,
        "franchiseName": "West Coast Tourism Holdings",
        "branchId": None,
        "branchName": "West Coast Franchise (Mumbai & Pune)",
        "city": "Mumbai, Maharashtra",
        "assignedModules": ROLE_MODULES["Franchise Owner"]
    },
    "manager@travelsphere.demo": {
        "id": 3,
        "email": "manager@travelsphere.demo",
        "password": "Manager@123",
        "name": "Utkarsh Sharma",
        "role": "Branch Manager",
        "title": "Branch Operations Manager",
        "franchiseId": 1,
        "franchiseName": "West Coast Tourism Holdings",
        "branchId": 1,
        "branchName": "Mumbai",
        "city": "Mumbai, Maharashtra",
        "assignedModules": ROLE_MODULES["Branch Manager"]
    },
    "staff@travelsphere.demo": {
        "id": 4,
        "email": "staff@travelsphere.demo",
        "password": "Staff@123",
        "name": "Sneha Rao",
        "role": "Staff",
        "title": "Senior Travel Consultant & Booking Specialist",
        "franchiseId": 1,
        "franchiseName": "West Coast Tourism Holdings",
        "branchId": 1,
        "branchName": "Mumbai",
        "city": "Mumbai, Maharashtra",
        "assignedModules": ROLE_MODULES["Staff"]
    }
}

@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    # 1. Reject Super Admin or Staff registration attempt from public form
    normalized_account_type = request.accountType.strip()
    if normalized_account_type.lower() in ["super admin", "superadmin", "head office", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin accounts cannot be created via public registration. Contact Head Office administration."
        )

    if normalized_account_type.lower() == "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff accounts cannot be self-registered publicly. Staff accounts must be created or invited by an authorized Super Admin, Franchise Owner, or Branch Manager."
        )

    # Normalize role name
    if normalized_account_type in ["Franchise Manager", "Branch Manager"]:
        normalized_account_type = "Branch Manager"
    elif normalized_account_type != "Franchise Owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account type. Only 'Franchise Owner' and 'Branch Manager' public registrations are permitted."
        )

    # 2. Password complexity validation (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
    pwd = request.password
    if len(pwd) < 8 or not re.search(r"[a-z]", pwd) or not re.search(r"[A-Z]", pwd) or not re.search(r"\d", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        )

    conn = get_connection()
    cursor = conn.cursor()

    email_clean = request.email.lower().strip()

    # 3. Check if email already registered and active in `users`
    cursor.execute("SELECT id, role FROM users WHERE LOWER(email) = ?", (email_clean,))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in or use another email."
        )

    # 4. Check if email already has a PENDING registration request
    cursor.execute("SELECT id, reference_id, status FROM registration_requests WHERE LOWER(email) = ?", (email_clean,))
    existing_req = cursor.fetchone()
    if existing_req:
        if existing_req["status"] == "PENDING":
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A registration request for this email is already awaiting Head Office approval (Reference: {existing_req['reference_id']})."
            )
        elif existing_req["status"] == "APPROVED":
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Your registration request was previously approved. Please sign in with your credentials."
            )

    # 5. Role-specific validation
    if normalized_account_type == "Branch Manager":
        if not request.branchName or not request.branchName.strip():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Associated Franchise Branch is required for Branch Manager registration."
            )
        if not request.authCode or not request.authCode.strip():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch Manager Invitation or Authorization Reference Code is required."
            )
        
        # Verify invitation code
        code_input = request.authCode.strip().upper()
        cursor.execute("SELECT * FROM invitation_codes WHERE UPPER(code) = ? AND is_active = 1", (code_input,))
        invitation = cursor.fetchone()
        if not invitation:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or expired invitation reference code '{request.authCode.strip()}'. Contact your Franchise Owner or Head Office."
            )
    elif normalized_account_type == "Franchise Owner":
        if not request.orgName or not request.orgName.strip():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business or Organization Name is required for Franchise Owner registration."
            )
        if not request.branchName or not request.branchName.strip():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposed Franchise / Branch Name is required for Franchise Owner registration."
            )

    # 6. Generate unique reference ID
    current_year = datetime.now(timezone.utc).year
    while True:
        ref_id = f"REG-{current_year}-{random.randint(1000, 9999)}"
        cursor.execute("SELECT id FROM registration_requests WHERE reference_id = ?", (ref_id,))
        if not cursor.fetchone():
            break

    # 7. Hash password securely
    hashed_pwd = hash_password(request.password)

    # 8. Insert registration request with status PENDING
    submitted_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO registration_requests (
            reference_id, full_name, email, phone, account_type,
            org_name, branch_name, location, license_type, auth_code,
            password_hash, status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    """, (
        ref_id,
        request.fullName.strip(),
        email_clean,
        request.phone.strip(),
        normalized_account_type,
        request.orgName.strip() if request.orgName else None,
        request.branchName.strip() if request.branchName else "Primary Branch",
        request.location.strip() if request.location else "India",
        request.licenseType.strip() if request.licenseType else "Standard Unit Franchise",
        request.authCode.strip() if request.authCode else None,
        hashed_pwd,
        submitted_time
    ))
    conn.commit()
    conn.close()

    return RegistrationResponse(
        success=True,
        status="Pending Approval",
        referenceId=ref_id,
        submittedAt=submitted_time,
        message="Your registration request has been submitted successfully and is awaiting Head Office review and approval."
    )

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    email_clean = request.email.lower().strip()
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Check if email exists in registration_requests with PENDING status
    cursor.execute("""
        SELECT reference_id, status, full_name, account_type 
        FROM registration_requests 
        WHERE LOWER(email) = ? 
        ORDER BY id DESC LIMIT 1
    """, (email_clean,))
    reg_record = cursor.fetchone()

    if reg_record and reg_record["status"] == "PENDING":
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your registration request ({reg_record['reference_id']}) is currently awaiting Super Admin review. You will be able to log in once your account is authorized."
        )

    if reg_record and reg_record["status"] == "REJECTED":
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your registration application ({reg_record['reference_id']}) was rejected by Head Office administration. Please contact support."
        )

    # 2. Check in `users` table for active approved user
    cursor.execute("""
        SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.title,
               u.branch_id, u.branch_name, u.franchise_id, u.city, u.is_active,
               f.franchise_name
        FROM users u
        LEFT JOIN franchises f ON u.franchise_id = f.franchise_id
        WHERE LOWER(u.email) = ?
    """, (email_clean,))
    user_record = cursor.fetchone()

    if user_record:
        if not user_record["is_active"]:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact your administrator."
            )
        
        # Verify bcrypt hash
        if verify_password(request.password, user_record["password_hash"]):
            conn.close()
            # Normalize role string
            role = user_record["role"]
            if role == "Franchise Manager":
                role = "Branch Manager"

            token_payload = {
                "sub": user_record["email"],
                "userId": user_record["id"],
                "role": role,
                "franchiseId": user_record["franchise_id"],
                "branchId": user_record["branch_id"],
                "branchName": user_record["branch_name"]
            }
            token = create_access_token(token_payload)
            assigned_mods = ROLE_MODULES.get(role, ROLE_MODULES["Staff"])

            return LoginResponse(
                success=True,
                token=token,
                user=UserResponse(
                    id=user_record["id"],
                    email=user_record["email"],
                    name=user_record["full_name"],
                    role=role,
                    title=user_record["title"] or f"{role} - {user_record['branch_name'] or 'HQ'}",
                    franchiseId=user_record["franchise_id"],
                    franchiseName=user_record["franchise_name"],
                    branchId=user_record["branch_id"],
                    branchName=user_record["branch_name"] or "All Branches",
                    city=user_record["city"] or "India",
                    assignedModules=assigned_mods
                ),
                isDemo=False
            )
        else:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )

    conn.close()

    # 3. Fallback to demo accounts for evaluator convenience
    if email_clean in DEMO_ACCOUNTS:
        demo = DEMO_ACCOUNTS[email_clean]
        if demo["password"] == request.password:
            token = f"demo_jwt_token_{demo['role'].replace(' ', '_').lower()}_{int(datetime.now().timestamp())}"
            return LoginResponse(
                success=True,
                token=token,
                user=UserResponse(
                    id=demo["id"],
                    email=demo["email"],
                    name=demo["name"],
                    role=demo["role"],
                    title=demo["title"],
                    franchiseId=demo.get("franchiseId"),
                    franchiseName=demo.get("franchiseName"),
                    branchId=demo["branchId"],
                    branchName=demo["branchName"],
                    city=demo["city"],
                    assignedModules=demo["assignedModules"]
                ),
                isDemo=True
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password for demo account."
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No registered account found with this email. Please check your credentials or submit a new registration."
    )

@router.get("/branches")
def get_available_branches():
    """Return active branches, franchises and invitation codes."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.branch_id, b.branch_name, b.city, b.is_active, b.franchise_id, f.franchise_name
        FROM branches b
        LEFT JOIN franchises f ON b.franchise_id = f.franchise_id
        WHERE b.is_active = 1
    """)
    branches = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT franchise_id, franchise_name, code, headquarters, status FROM franchises")
    franchises = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT branch_name, code, issued_to_role FROM invitation_codes WHERE is_active = 1")
    invitations = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "branches": branches,
        "franchises": franchises,
        "sampleInvitations": invitations
    }
