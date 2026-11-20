import sqlite3
import os
import bcrypt
from datetime import datetime
from database.db_connection import get_connection

def hash_password(pwd: str) -> str:
    return bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

def migrate_database():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Create franchises table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS franchises (
            franchise_id INTEGER PRIMARY KEY AUTOINCREMENT,
            franchise_name TEXT UNIQUE NOT NULL,
            code TEXT UNIQUE NOT NULL,
            owner_id INTEGER,
            headquarters TEXT,
            status TEXT DEFAULT 'Active',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Add franchise_id column to branches if not exists
    cursor.execute("PRAGMA table_info(branches)")
    branch_cols = [c[1] for c in cursor.fetchall()]
    if "franchise_id" not in branch_cols:
        cursor.execute("ALTER TABLE branches ADD COLUMN franchise_id INTEGER REFERENCES franchises(franchise_id)")

    # 3. Add franchise_id column to users if not exists
    cursor.execute("PRAGMA table_info(users)")
    user_cols = [c[1] for c in cursor.fetchall()]
    if "franchise_id" not in user_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN franchise_id INTEGER REFERENCES franchises(franchise_id)")

    # 4. Seed authorized Franchises
    franchises = [
        (1, "West Coast Tourism Holdings", "FRAN-WCT-01", 2, "Mumbai HQ", "Active"),
        (2, "Deccan Travel Enterprises", "FRAN-DTE-02", None, "Hyderabad", "Active"),
        (3, "Central India Tourism Group", "FRAN-CIT-03", None, "Nagpur", "Active")
    ]
    for fid, fname, fcode, owner_id, hq, status in franchises:
        cursor.execute("""
            INSERT OR REPLACE INTO franchises (franchise_id, franchise_name, code, owner_id, headquarters, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (fid, fname, fcode, owner_id, hq, status))

    # 5. Link existing 5 branches to authorized Franchises
    # Mumbai (1) & Pune (2) -> West Coast Tourism Holdings (1)
    # Hyderabad (3) & Bengaluru (5) -> Deccan Travel Enterprises (2)
    # Nagpur (4) -> Central India Tourism Group (3)
    branch_mappings = [
        ("Mumbai", 1),
        ("Pune", 1),
        ("Hyderabad", 2),
        ("Nagpur", 3),
        ("Bengaluru", 2)
    ]
    for bname, fid in branch_mappings:
        cursor.execute("UPDATE branches SET franchise_id = ? WHERE branch_name = ?", (fid, bname))

    # 6. Safely migrate existing users with 'Franchise Manager' to 'Branch Manager'
    cursor.execute("UPDATE users SET role = 'Branch Manager' WHERE role = 'Franchise Manager'")
    cursor.execute("UPDATE registration_requests SET account_type = 'Branch Manager' WHERE account_type = 'Franchise Manager'")

    # 7. Seed/Update the four authorized roles demo accounts
    demo_users = [
        (
            1,
            "admin@travelsphere.demo",
            hash_password("Admin@123"),
            "Rujaal Ghate",
            "+91 98200 11223",
            "Super Admin",
            "Head Office Administrator",
            None,
            "All Branches",
            None,
            "Mumbai HQ",
            1
        ),
        (
            2,
            "owner@travelsphere.demo",
            hash_password("Owner@123"),
            "Vennela Eddum",
            "+91 98200 44556",
            "Franchise Owner",
            "Franchise Partner & Principal",
            None,
            "West Coast Franchise (Mumbai & Pune)",
            1,
            "Mumbai, Maharashtra",
            1
        ),
        (
            3,
            "manager@travelsphere.demo",
            hash_password("Manager@123"),
            "Utkarsh Sharma",
            "+91 98200 77889",
            "Branch Manager",
            "Branch Operations Manager",
            1,
            "Mumbai",
            1,
            "Mumbai, Maharashtra",
            1
        ),
        (
            4,
            "staff@travelsphere.demo",
            hash_password("Staff@123"),
            "Sneha Rao",
            "+91 98200 33445",
            "Staff",
            "Senior Travel Consultant & Booking Specialist",
            1,
            "Mumbai",
            1,
            "Mumbai, Maharashtra",
            1
        )
    ]

    for uid, email, phash, name, phone, role, title, bid, bname, fid, city, is_act in demo_users:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                UPDATE users
                SET role = ?, title = ?, branch_id = ?, branch_name = ?, franchise_id = ?, is_active = ?, password_hash = ?
                WHERE email = ?
            """, (role, title, bid, bname, fid, is_act, phash, email))
        else:
            cursor.execute("""
                INSERT INTO users (email, password_hash, full_name, phone, role, title, branch_id, branch_name, franchise_id, city, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (email, phash, name, phone, role, title, bid, bname, fid, city, is_act))

    # 8. Create tasks table for workforce management
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            assigned_to INTEGER NOT NULL,
            assigned_by INTEGER,
            branch_id INTEGER,
            franchise_id INTEGER,
            due_date TEXT NOT NULL,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            FOREIGN KEY (assigned_by) REFERENCES users(id),
            FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
            FOREIGN KEY (franchise_id) REFERENCES franchises(franchise_id)
        )
    """)

    # Seed sample tasks for staff (id=4) and manager (id=3)
    sample_tasks = [
        ("Verify Visa Documents for Swiss Alps Tour", "Review passport validity and visa requirements for Mr. Mehra group (3 pax)", 4, 3, 1, 1, "2026-11-22", "High", "In Progress"),
        ("Follow up with Kerala Backwaters Leads", "Contact 5 warm leads from weekend campaign enquiry form", 4, 3, 1, 1, "2026-11-21", "Medium", "Pending"),
        ("Reconfirm Luxury Coach for Goa Explorer", "Call partner Coastal Translines for bus booking confirmation", 4, 3, 1, 1, "2026-11-23", "Low", "Completed"),
        ("Conduct Weekly Mumbai Branch Safety Briefing", "Hold mandatory operations sync with ground tour coordinators", 3, 2, 1, 1, "2026-11-24", "High", "Pending")
    ]
    cursor.execute("SELECT COUNT(*) as cnt FROM tasks")
    if cursor.fetchone()["cnt"] == 0:
        for title, desc, assigned_to, assigned_by, bid, fid, due, prio, stat in sample_tasks:
            cursor.execute("""
                INSERT INTO tasks (title, description, assigned_to, assigned_by, branch_id, franchise_id, due_date, priority, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, desc, assigned_to, assigned_by, bid, fid, due, prio, stat))

    # 9. Create bookings table with staff and franchise linkage
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_reference TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            package_name TEXT NOT NULL,
            branch_id INTEGER NOT NULL,
            franchise_id INTEGER NOT NULL,
            assigned_staff_id INTEGER,
            travel_date TEXT NOT NULL,
            pax INTEGER DEFAULT 2,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'Confirmed',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
            FOREIGN KEY (franchise_id) REFERENCES franchises(franchise_id),
            FOREIGN KEY (assigned_staff_id) REFERENCES users(id)
        )
    """)

    # Seed sample bookings linked to staff (id=4) and Mumbai branch
    sample_bookings = [
        ("TS-BK-2026-901", "Aarav Sharma", "Majestic Rajasthan Royal Tour", 1, 1, 4, "2026-12-05", 2, 78000, "Confirmed"),
        ("TS-BK-2026-902", "Deepak & Neha Mehta", "Kerala Backwaters & Houseboat Extravaganza", 1, 1, 4, "2026-12-12", 4, 115000, "Confirmed"),
        ("TS-BK-2026-903", "Priya Nair", "Goa Coastal Heritage & Water Sports", 1, 1, 4, "2026-11-28", 2, 42000, "Confirmed"),
        ("TS-BK-2026-904", "Vikram Rathore", "Kashmir Paradise Valley Special", 1, 1, None, "2026-12-20", 3, 95000, "Pending"),
        ("TS-BK-2026-905", "Kiran Reddy", "Golden Triangle Classical Tour", 3, 2, None, "2026-12-08", 2, 64000, "Confirmed")
    ]
    cursor.execute("SELECT COUNT(*) as cnt FROM bookings")
    if cursor.fetchone()["cnt"] == 0:
        for ref, cust, pkg, bid, fid, staff_id, tdate, pax, amt, stat in sample_bookings:
            cursor.execute("""
                INSERT INTO bookings (booking_reference, customer_name, package_name, branch_id, franchise_id, assigned_staff_id, travel_date, pax, amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (ref, cust, pkg, bid, fid, staff_id, tdate, pax, amt, stat))

    # 10. Update invitation codes table with Branch Manager and Staff references
    cursor.execute("UPDATE invitation_codes SET issued_to_role = 'Branch Manager' WHERE issued_to_role = 'Franchise Manager'")
    cursor.execute("""
        INSERT OR IGNORE INTO invitation_codes (branch_name, code, issued_to_role)
        VALUES 
            ('Mumbai', 'STAFF-MUM-2026', 'Staff'),
            ('Pune', 'STAFF-PUN-2026', 'Staff'),
            ('All', 'STAFF-ALL-2026', 'Staff')
    """)

    conn.commit()
    conn.close()
    print("Database migration to 4-role hierarchy with franchise-branch linkage completed successfully!")

if __name__ == "__main__":
    migrate_database()
