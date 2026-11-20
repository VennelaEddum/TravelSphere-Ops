import sqlite3
import os
import bcrypt
from datetime import datetime
from database.db_connection import get_connection, DB_PATH

def create_auth_tables():
    connection = get_connection()
    cursor = connection.cursor()

    # 1. Create invitation_codes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invitation_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            branch_name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            issued_to_role TEXT DEFAULT 'Franchise Manager',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Create registration_requests table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS registration_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            account_type TEXT NOT NULL,
            org_name TEXT,
            branch_name TEXT NOT NULL,
            location TEXT NOT NULL,
            license_type TEXT,
            auth_code TEXT,
            password_hash TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            rejection_reason TEXT,
            submitted_at TEXT NOT NULL,
            reviewed_at TEXT,
            reviewed_by TEXT
        )
    """)

    # 3. Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL,
            title TEXT,
            branch_id INTEGER,
            branch_name TEXT,
            city TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            registration_ref TEXT
        )
    """)

    # Index for fast lookup by email and status
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reg_email ON registration_requests(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reg_ref ON registration_requests(reference_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_requests(status)")

    # Seed initial invitation codes if not present
    seed_invitations = [
        ("Mumbai", "INV-MUM-2026", "Franchise Manager"),
        ("Pune", "INV-PUN-2026", "Franchise Manager"),
        ("Hyderabad", "INV-HYD-2026", "Franchise Manager"),
        ("Nagpur", "INV-NAG-2026", "Franchise Manager"),
        ("Bengaluru", "INV-BLR-2026", "Franchise Manager"),
        ("All", "SANCHARI-MGR-2026", "Franchise Manager"),
        ("HQ", "HQ-AUTH-99", "Franchise Manager")
    ]

    for branch, code, role in seed_invitations:
        cursor.execute(
            "INSERT OR IGNORE INTO invitation_codes (branch_name, code, issued_to_role) VALUES (?, ?, ?)",
            (branch, code, role)
        )

    # Seed default system users (Super Admin and demo accounts) with real bcrypt hashes
    def hash_password(pwd: str) -> str:
        return bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    seed_users = [
        (
            "admin@travelsphere.demo",
            hash_password("Admin@123"),
            "Rujaal Ghate",
            "+91 98200 11223",
            "Super Admin",
            "Head Office Administrator",
            None,
            "All Branches",
            "Mumbai HQ"
        ),
        (
            "owner@travelsphere.demo",
            hash_password("Owner@123"),
            "Vennela Eddum",
            "+91 98200 44556",
            "Franchise Owner",
            "Franchise Partner & Principal",
            1,
            "Mumbai",
            "Mumbai, Maharashtra"
        ),
        (
            "manager@travelsphere.demo",
            hash_password("Manager@123"),
            "Utkarsh Sharma",
            "+91 98200 77889",
            "Franchise Manager",
            "Branch Operations Manager",
            1,
            "Mumbai",
            "Mumbai, Maharashtra"
        )
    ]

    for email, pwd_hash, name, phone, role, title, branch_id, branch_name, city in seed_users:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (email, password_hash, full_name, phone, role, title, branch_id, branch_name, city, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (email, pwd_hash, name, phone, role, title, branch_id, branch_name, city))

    # Also seed a realistic pending registration request for Super Admin demonstration
    cursor.execute("SELECT id FROM registration_requests WHERE reference_id = 'REG-2026-4821'")
    if not cursor.fetchone():
        demo_pending_pwd = hash_password("Partner@2026")
        cursor.execute("""
            INSERT INTO registration_requests (
                reference_id, full_name, email, phone, account_type,
                org_name, branch_name, location, license_type, auth_code,
                password_hash, status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "REG-2026-4821",
            "Amitabh Sen",
            "amitabh.sen@bengalurux.in",
            "+91 98450 12345",
            "Franchise Owner",
            "Sen Heritage Journeys LLP",
            "Bengaluru Central",
            "Bengaluru, Karnataka",
            "Master Territory Franchise",
            None,
            demo_pending_pwd,
            "PENDING",
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        ))

    connection.commit()
    connection.close()
    print("Auth & registration tables created and seeded successfully!")

if __name__ == "__main__":
    create_auth_tables()
