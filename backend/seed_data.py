"""
AssetFlow — Database Seed Script
Run from the backend/ directory with the venv activated:
    python seed_data.py

Uses the existing DATABASE_URL from .env.
All inserts use ON CONFLICT DO NOTHING so re-running is safe.
"""

import asyncio
import datetime
import json
from pathlib import Path

import asyncpg


def _d(s):
    return datetime.date.fromisoformat(s) if s else None


def _dt(s):
    if not s:
        return None
    return datetime.datetime.fromisoformat(s.replace('+00', '+00:00'))


# ── Existing accounts (already in DB, do NOT re-insert) ─────────────────────
ADMIN_ID    = 'f1de97bb-f8e7-4366-8b5c-2fe0e0031cc2'   # admin@assetflow.com
TEST_ID     = '4d267590-d510-4458-a687-a252c4cc3669'    # test123@gmail.com

# ── New employees ────────────────────────────────────────────────────────────
MGR_ID      = 'a1000000-0000-4000-8000-000000000001'    # Arjun Shah   — asset_manager
DH_ENG_ID   = 'a1000000-0000-4000-8000-000000000002'    # Meera Patel  — department_head (Eng)
RAJ_ID      = 'a1000000-0000-4000-8000-000000000003'    # Raj Kumar    — employee
PRIYA_ID    = 'a1000000-0000-4000-8000-000000000004'    # Priya Sharma — employee
ANKIT_ID    = 'a1000000-0000-4000-8000-000000000005'    # Ankit Verma  — employee
DH_FIN_ID   = 'a1000000-0000-4000-8000-000000000006'    # Nisha Gupta  — department_head (Fin)

# ── Departments ──────────────────────────────────────────────────────────────
DEPT_ENG_ID = 'b1000000-0000-4000-8000-000000000001'
DEPT_FIN_ID = 'b1000000-0000-4000-8000-000000000002'
DEPT_FAC_ID = 'b1000000-0000-4000-8000-000000000003'
DEPT_HR_ID  = 'b1000000-0000-4000-8000-000000000004'

# ── Asset categories ─────────────────────────────────────────────────────────
CAT_ELEC_ID = 'c1000000-0000-4000-8000-000000000001'
CAT_FURN_ID = 'c1000000-0000-4000-8000-000000000002'
CAT_VEH_ID  = 'c1000000-0000-4000-8000-000000000003'
CAT_OFF_ID  = 'c1000000-0000-4000-8000-000000000004'

# ── Assets ───────────────────────────────────────────────────────────────────
MACBOOK_ID    = 'd1000000-0000-4000-8000-000000000001'   # allocated → test user
MONITOR_ID    = 'd1000000-0000-4000-8000-000000000002'   # available (was returned)
IPHONE_ID     = 'd1000000-0000-4000-8000-000000000003'   # allocated → Raj
CHAIR_ID      = 'd1000000-0000-4000-8000-000000000004'   # available
DESK_ID       = 'd1000000-0000-4000-8000-000000000005'   # allocated → Priya
INNOVA_ID     = 'd1000000-0000-4000-8000-000000000006'   # under_maintenance
PROJECTOR_ID  = 'd1000000-0000-4000-8000-000000000007'   # available + bookable
PRINTER_ID    = 'd1000000-0000-4000-8000-000000000008'   # available
SURFACE_ID    = 'd1000000-0000-4000-8000-000000000009'   # allocated → Ankit (OVERDUE)
CABINET_ID    = 'd1000000-0000-4000-8000-000000000010'   # available
FORD_ID       = 'd1000000-0000-4000-8000-000000000011'   # available
IPAD_ID       = 'd1000000-0000-4000-8000-000000000012'   # available + bookable

# ── Allocations ──────────────────────────────────────────────────────────────
ALLOC1_ID  = 'e1000000-0000-4000-8000-000000000001'   # MacBook → test (active)
ALLOC2_ID  = 'e1000000-0000-4000-8000-000000000002'   # iPhone  → Raj  (active)
ALLOC3_ID  = 'e1000000-0000-4000-8000-000000000003'   # Desk    → Priya(active)
ALLOC4_ID  = 'e1000000-0000-4000-8000-000000000004'   # Surface → Ankit(overdue)
ALLOC5_ID  = 'e1000000-0000-4000-8000-000000000005'   # Monitor → Meera(returned)

# ── Transfer request ─────────────────────────────────────────────────────────
TRANSFER1_ID = 'f1000000-0000-4000-8000-000000000001'  # iPhone: Raj → test (pending)

# ── Bookings ─────────────────────────────────────────────────────────────────
BOOKING1_ID = 'b7000000-0000-4000-8000-000000000001'  # Projector → Raj   (upcoming)
BOOKING2_ID = 'b7000000-0000-4000-8000-000000000002'  # Projector → Priya (completed)
BOOKING3_ID = 'b7000000-0000-4000-8000-000000000003'  # iPad      → test  (upcoming)

# ── Maintenance requests ─────────────────────────────────────────────────────
MAINT1_ID = 'b8000000-0000-4000-8000-000000000001'   # Innova   (in_progress)
MAINT2_ID = 'b8000000-0000-4000-8000-000000000002'   # MacBook  (pending)
MAINT3_ID = 'b8000000-0000-4000-8000-000000000003'   # Cabinet  (resolved)

# ── Audit cycles ─────────────────────────────────────────────────────────────
AUDIT1_ID = 'b9000000-0000-4000-8000-000000000001'   # Q2 Eng Audit (closed)
AUDIT2_ID = 'b9000000-0000-4000-8000-000000000002'   # Q3 Full Audit(in_progress)

ASGN1_ID  = 'ba000000-0000-4000-8000-000000000001'
ASGN2_ID  = 'ba000000-0000-4000-8000-000000000002'

ITEM1_ID  = 'bb000000-0000-4000-8000-000000000001'
ITEM2_ID  = 'bb000000-0000-4000-8000-000000000002'
ITEM3_ID  = 'bb000000-0000-4000-8000-000000000003'
ITEM4_ID  = 'bb000000-0000-4000-8000-000000000004'
ITEM5_ID  = 'bb000000-0000-4000-8000-000000000005'
ITEM6_ID  = 'bb000000-0000-4000-8000-000000000006'
ITEM7_ID  = 'bb000000-0000-4000-8000-000000000007'
ITEM8_ID  = 'bb000000-0000-4000-8000-000000000008'
ITEM9_ID  = 'bb000000-0000-4000-8000-000000000009'
ITEM10_ID = 'bb000000-0000-4000-8000-000000000010'
ITEM11_ID = 'bb000000-0000-4000-8000-000000000011'
ITEM12_ID = 'bb000000-0000-4000-8000-000000000012'

# ── Notifications ────────────────────────────────────────────────────────────
NOTIF1_ID = 'bc000000-0000-4000-8000-000000000001'
NOTIF2_ID = 'bc000000-0000-4000-8000-000000000002'
NOTIF3_ID = 'bc000000-0000-4000-8000-000000000003'
NOTIF4_ID = 'bc000000-0000-4000-8000-000000000004'
NOTIF5_ID = 'bc000000-0000-4000-8000-000000000005'
NOTIF6_ID = 'bc000000-0000-4000-8000-000000000006'
NOTIF7_ID = 'bc000000-0000-4000-8000-000000000007'

# ── Activity logs ────────────────────────────────────────────────────────────
LOG1_ID = 'bd000000-0000-4000-8000-000000000001'
LOG2_ID = 'bd000000-0000-4000-8000-000000000002'
LOG3_ID = 'bd000000-0000-4000-8000-000000000003'
LOG4_ID = 'bd000000-0000-4000-8000-000000000004'
LOG5_ID = 'bd000000-0000-4000-8000-000000000005'
LOG6_ID = 'bd000000-0000-4000-8000-000000000006'

# bcrypt hash of "Admin@1234" — all new employees share this password for testing
_HASH = '$2b$12$Y92TUU5f2mq84exO2FSVNem0Pt5yLV7Y.hqN8u/oAPquF8ikwzuG6'


def _load_db_url() -> str:
    env_path = Path(__file__).parent / '.env'
    with open(env_path) as fh:
        for line in fh:
            line = line.strip()
            if line.startswith('DATABASE_URL='):
                url = line.split('=', 1)[1]
                return url.replace('postgresql+asyncpg://', 'postgresql://')
    raise RuntimeError('DATABASE_URL not found in .env')


async def _employees(conn: asyncpg.Connection) -> None:
    rows = [
        (MGR_ID,    'arjun.shah@assetflow.com',  _HASH, 'Arjun',  'Shah',   '+91-9800000001', 'asset_manager'),
        (DH_ENG_ID, 'meera.patel@assetflow.com', _HASH, 'Meera',  'Patel',  '+91-9800000002', 'department_head'),
        (RAJ_ID,    'raj.kumar@assetflow.com',    _HASH, 'Raj',    'Kumar',  '+91-9800000003', 'employee'),
        (PRIYA_ID,  'priya.sharma@assetflow.com', _HASH, 'Priya',  'Sharma', '+91-9800000004', 'employee'),
        (ANKIT_ID,  'ankit.verma@assetflow.com',  _HASH, 'Ankit',  'Verma',  '+91-9800000005', 'employee'),
        (DH_FIN_ID, 'nisha.gupta@assetflow.com',  _HASH, 'Nisha',  'Gupta',  '+91-9800000006', 'department_head'),
    ]
    await conn.executemany(
        """INSERT INTO employees
               (id, email, hashed_password, first_name, last_name, phone, role, status,
                created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'active',
                   '2026-07-01 06:00:00+00','2026-07-01 06:00:00+00')
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _departments(conn: asyncpg.Connection) -> None:
    rows = [
        (DEPT_ENG_ID, 'Engineering',      'ENG', 'Core product and infrastructure team'),
        (DEPT_FIN_ID, 'Finance',          'FIN', 'Financial planning and accounting'),
        (DEPT_FAC_ID, 'Facilities',       'FAC', 'Office and facilities management'),
        (DEPT_HR_ID,  'Human Resources',  'HR',  'People operations and recruitment'),
    ]
    await conn.executemany(
        """INSERT INTO departments
               (id, name, code, description, status, created_at, updated_at)
           VALUES ($1,$2,$3,$4,'active',
                   '2026-07-01 06:30:00+00','2026-07-01 06:30:00+00')
           ON CONFLICT DO NOTHING""",
        rows,
    )
    # Wire department heads
    await conn.execute(
        f"UPDATE departments SET head_id='{DH_ENG_ID}' WHERE id='{DEPT_ENG_ID}'"
    )
    await conn.execute(
        f"UPDATE departments SET head_id='{DH_FIN_ID}' WHERE id='{DEPT_FIN_ID}'"
    )
    # Assign employees to departments
    mapping = [
        (DEPT_ENG_ID, MGR_ID),
        (DEPT_ENG_ID, DH_ENG_ID),
        (DEPT_ENG_ID, RAJ_ID),
        (DEPT_ENG_ID, TEST_ID),
        (DEPT_FIN_ID, PRIYA_ID),
        (DEPT_FIN_ID, DH_FIN_ID),
        (DEPT_FAC_ID, ANKIT_ID),
    ]
    for dept_id, emp_id in mapping:
        await conn.execute(
            f"UPDATE employees SET department_id='{dept_id}' WHERE id='{emp_id}'"
        )


async def _categories(conn: asyncpg.Connection) -> None:
    rows = [
        (CAT_ELEC_ID, 'Electronics',      'Laptops, phones, monitors, tablets',
         json.dumps({'warranty_period': 'string', 'serial_number': 'string', 'specs': 'string'})),
        (CAT_FURN_ID, 'Furniture',        'Chairs, desks, cabinets, shelving',
         json.dumps({'material': 'string', 'color': 'string', 'dimensions': 'string'})),
        (CAT_VEH_ID,  'Vehicles',         'Cars, vans, bikes for company use',
         json.dumps({'license_plate': 'string', 'fuel_type': 'string', 'last_service_date': 'string'})),
        (CAT_OFF_ID,  'Office Equipment', 'Printers, projectors, scanners, ACs',
         json.dumps({'model_number': 'string', 'warranty_period': 'string', 'capacity': 'string'})),
    ]
    await conn.executemany(
        """INSERT INTO asset_categories
               (id, name, description, custom_fields, status, created_at, updated_at)
           VALUES ($1,$2,$3,$4::jsonb,'active',
                   '2026-07-01 07:00:00+00','2026-07-01 07:00:00+00')
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _assets(conn: asyncpg.Connection) -> None:
    # (id, name, tag, serial, cat_id, condition, status, location, is_bookable, acq_date, cost, notes)
    rows = [
        (MACBOOK_ID,   'MacBook Pro 14"',              'AF-0001', 'SN-MBP-001',  CAT_ELEC_ID,
         'good',      'allocated',          'Engineering Floor', False,
         _d('2025-01-15'), 185000,  '16GB RAM, 512GB SSD, Apple M3 chip'),
        (MONITOR_ID,   'Dell UltraSharp 27" 4K',       'AF-0002', 'SN-DL-002',   CAT_ELEC_ID,
         'excellent', 'available',          'Engineering Floor', False,
         _d('2025-02-10'),  42000,  '4K IPS, 60Hz, USB-C hub, height-adjustable'),
        (IPHONE_ID,    'iPhone 14 Pro',                 'AF-0003', 'SN-IP-003',   CAT_ELEC_ID,
         'good',      'allocated',          'Engineering Floor', False,
         _d('2025-03-05'),  95000,  '256GB, Space Black, with Apple case'),
        (CHAIR_ID,     'Herman Miller Aeron',           'AF-0004', 'SN-HM-004',   CAT_FURN_ID,
         'excellent', 'available',          'Finance Floor',     False,
         _d('2024-11-01'),  65000,  'Ergonomic, Size C, PostureFit SL, black'),
        (DESK_ID,      'IKEA Bekant Standing Desk',     'AF-0005', 'SN-IK-005',   CAT_FURN_ID,
         'good',      'allocated',          'Finance Floor',     False,
         _d('2024-12-01'),  28000,  'Sit-stand motorised, 160x80cm, white'),
        (INNOVA_ID,    'Toyota Innova Crysta 2022',     'AF-0006', 'KA01AA1234',  CAT_VEH_ID,
         'fair',      'under_maintenance',  'Parking B1',        False,
         _d('2022-06-01'), 2200000, '7-seater diesel, silver, BS6'),
        (PROJECTOR_ID, 'Epson EB-X51 Projector',        'AF-0007', 'SN-EP-007',   CAT_OFF_ID,
         'good',      'available',          'Conference Room A', True,
         _d('2024-08-15'),  35000,  '3800 lumens, XGA, HDMI + VGA, 5yr bulb life'),
        (PRINTER_ID,   'HP LaserJet Pro M428dw',        'AF-0008', 'SN-HP-008',   CAT_OFF_ID,
         'good',      'available',          'Office Floor',      False,
         _d('2024-09-20'),  22000,  'Duplex auto, WiFi, 38ppm, A4'),
        (SURFACE_ID,   'Microsoft Surface Pro 9',       'AF-0009', 'SN-MS-009',   CAT_ELEC_ID,
         'fair',      'allocated',          'Facilities Floor',  False,
         _d('2024-06-01'), 115000,  '16GB RAM, 256GB SSD, i7-1255U'),
        (CABINET_ID,   'Godrej Steel Filing Cabinet',   'AF-0010', 'SN-GD-010',   CAT_FURN_ID,
         'good',      'available',          'HR Floor',          False,
         _d('2023-01-15'),   8500,  '4-drawer vertical, key lock, grey'),
        (FORD_ID,      'Ford Transit Van 2023',         'AF-0011', 'KA02BB5678',  CAT_VEH_ID,
         'excellent', 'available',          'Parking B1',        False,
         _d('2023-07-01'), 2800000, '9-seat cargo, diesel, white, BS6'),
        (IPAD_ID,      'iPad Pro 12.9" M2',             'AF-0012', 'SN-IPAD-012', CAT_ELEC_ID,
         'excellent', 'available',          'Conference Room A', True,
         _d('2025-04-01'),  98000,  '256GB WiFi+Cellular, Space Grey, with Pencil 2'),
    ]
    await conn.executemany(
        """INSERT INTO assets
               (id, name, asset_tag, serial_number, category_id, condition, status, location,
                is_bookable, acquisition_date, acquisition_cost, notes,
                created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
                   '2026-07-03 08:00:00+00','2026-07-03 08:00:00+00')
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _allocations(conn: asyncpg.Connection) -> None:
    # (id, asset_id, employee_id, department_id, allocated_by, status,
    #  expected_return_date, returned_at, condition_on_return, return_notes,
    #  return_approved_by, created_at, updated_at)
    rows = [
        (ALLOC1_ID, MACBOOK_ID, TEST_ID,    None,        MGR_ID, 'active',
         _d('2026-08-15'), None, None, None, None,
         _dt('2026-07-05 09:00:00+00'), _dt('2026-07-05 09:00:00+00')),

        (ALLOC2_ID, IPHONE_ID,  RAJ_ID,     None,        MGR_ID, 'active',
         _d('2026-09-01'), None, None, None, None,
         _dt('2026-07-05 09:15:00+00'), _dt('2026-07-05 09:15:00+00')),

        (ALLOC3_ID, DESK_ID,    PRIYA_ID,   None,        MGR_ID, 'active',
         None, None, None, None, None,
         _dt('2026-07-05 09:30:00+00'), _dt('2026-07-05 09:30:00+00')),

        # Overdue — expected return was 30 Jun, now 12 Jul (12 days late)
        (ALLOC4_ID, SURFACE_ID, ANKIT_ID,   None,        MGR_ID, 'overdue',
         _d('2026-06-30'), None, None, None, None,
         _dt('2026-06-01 10:00:00+00'), _dt('2026-07-01 00:00:00+00')),

        # Returned — Meera had the monitor, returned it on 8 Jul
        (ALLOC5_ID, MONITOR_ID, DH_ENG_ID,  None,        MGR_ID, 'returned',
         _d('2026-07-10'), _dt('2026-07-08 17:00:00+00'), 'good',
         'Returned in good condition, all accessories included.', ADMIN_ID,
         _dt('2026-06-15 09:00:00+00'), _dt('2026-07-08 17:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO allocations
               (id, asset_id, employee_id, department_id, allocated_by, status,
                expected_return_date, returned_at, condition_on_return, return_notes,
                return_approved_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _transfers(conn: asyncpg.Connection) -> None:
    rows = [
        (TRANSFER1_ID, IPHONE_ID, RAJ_ID, TEST_ID, TEST_ID, None, 'pending',
         'I need this device for a client demo next week.',
         None, _dt('2026-07-10 11:00:00+00'), _dt('2026-07-10 11:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO transfer_requests
               (id, asset_id, from_employee_id, to_employee_id, requested_by,
                approved_by, status, reason, rejection_notes, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _bookings(conn: asyncpg.Connection) -> None:
    rows = [
        # Upcoming: Raj books projector for sprint review tomorrow
        (BOOKING1_ID, PROJECTOR_ID, RAJ_ID,
         _dt('2026-07-13 09:00:00+00'), _dt('2026-07-13 11:00:00+00'),
         'upcoming', 'Sprint review presentation for Q3 planning session.', None,
         _dt('2026-07-11 10:00:00+00'), _dt('2026-07-11 10:00:00+00')),

        # Completed: Priya booked projector yesterday
        (BOOKING2_ID, PROJECTOR_ID, PRIYA_ID,
         _dt('2026-07-11 14:00:00+00'), _dt('2026-07-11 16:00:00+00'),
         'completed', 'Finance quarterly budget review presentation.', None,
         _dt('2026-07-09 14:00:00+00'), _dt('2026-07-11 16:00:00+00')),

        # Upcoming: test user books iPad for client walkthrough
        (BOOKING3_ID, IPAD_ID, TEST_ID,
         _dt('2026-07-14 10:00:00+00'), _dt('2026-07-14 11:00:00+00'),
         'upcoming', 'Client walkthrough demo session.', None,
         _dt('2026-07-12 08:00:00+00'), _dt('2026-07-12 08:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO bookings
               (id, asset_id, booked_by, start_time, end_time,
                status, purpose, cancelled_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _maintenance(conn: asyncpg.Connection) -> None:
    # (id, asset_id, raised_by, description, priority, status,
    #  approved_by, technician_id, photo_url, resolved_at, resolution_notes,
    #  created_at, updated_at)
    rows = [
        # Innova: reported by Ankit, approved + in-progress (asset = under_maintenance)
        (MAINT1_ID, INNOVA_ID, ANKIT_ID,
         'Engine makes grinding noise at low RPM. Oil leak visible under the vehicle near the sump.',
         'high', 'in_progress',
         MGR_ID, MGR_ID, None, None, None,
         _dt('2026-07-07 09:00:00+00'), _dt('2026-07-09 10:00:00+00')),

        # MacBook: raised by test user, pending approval
        (MAINT2_ID, MACBOOK_ID, TEST_ID,
         'Battery drains from 100% to 0 within 3 hours under normal load. Coconut Battery shows 61% health.',
         'medium', 'pending',
         None, None, None, None, None,
         _dt('2026-07-11 15:00:00+00'), _dt('2026-07-11 15:00:00+00')),

        # Filing cabinet: resolved on 6 Jul
        (MAINT3_ID, CABINET_ID, ANKIT_ID,
         'Third drawer latch broken — drawer cannot be locked. Security risk for confidential documents.',
         'low', 'resolved',
         MGR_ID, MGR_ID, None, _dt('2026-07-06 17:00:00+00'),
         'Latch mechanism replaced with OEM part. All 4 locks tested and functioning correctly.',
         _dt('2026-07-01 11:00:00+00'), _dt('2026-07-06 17:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO maintenance_requests
               (id, asset_id, raised_by, description, priority, status,
                approved_by, technician_id, photo_url, resolved_at, resolution_notes,
                created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _audit_cycles(conn: asyncpg.Connection) -> None:
    rows = [
        # Q2 — Engineering scope, already closed
        (AUDIT1_ID, 'Q2 2026 Engineering Asset Audit', DEPT_ENG_ID, None,
         _d('2026-04-01'), _d('2026-06-30'), 'closed', ADMIN_ID,
         _dt('2026-04-01 09:00:00+00'), _dt('2026-07-01 18:00:00+00')),

        # Q3 — Full org, in progress
        (AUDIT2_ID, 'Q3 2026 Full Organisation Audit', None, None,
         _d('2026-07-01'), _d('2026-09-30'), 'in_progress', ADMIN_ID,
         _dt('2026-07-01 09:00:00+00'), _dt('2026-07-01 09:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO audit_cycles
               (id, name, scope_department_id, scope_location,
                start_date, end_date, status, created_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _audit_assignments(conn: asyncpg.Connection) -> None:
    rows = [
        (ASGN1_ID, AUDIT2_ID, TEST_ID, _dt('2026-07-01 09:30:00+00'), _dt('2026-07-01 09:30:00+00')),
        (ASGN2_ID, AUDIT2_ID, RAJ_ID,  _dt('2026-07-01 09:30:00+00'), _dt('2026-07-01 09:30:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO audit_assignments (id, cycle_id, auditor_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _audit_items(conn: asyncpg.Connection) -> None:
    # (id, cycle_id, asset_id, auditor_id, status, notes, verified_at, created_at, updated_at)
    rows = [
        (ITEM1_ID, AUDIT2_ID, MACBOOK_ID, TEST_ID,
         'verified', 'Found at Engineering desk. All accessories (charger, cable) present. Condition: good.',
         _dt('2026-07-10 10:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-10 10:00:00+00')),

        (ITEM2_ID, AUDIT2_ID, MONITOR_ID, RAJ_ID,
         'verified', 'Located in IT storage after return. Screen scratch-free. Stand and cables intact.',
         _dt('2026-07-10 10:30:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-10 10:30:00+00')),

        (ITEM3_ID, AUDIT2_ID, IPHONE_ID, RAJ_ID,
         'pending', None,
         None, _dt('2026-07-01 09:00:00+00'), _dt('2026-07-01 09:00:00+00')),

        (ITEM4_ID, AUDIT2_ID, CABINET_ID, TEST_ID,
         'missing', 'Cabinet not found at last recorded location (HR Floor). Enquiry sent to HR team.',
         _dt('2026-07-11 11:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 11:00:00+00')),
         
        (ITEM5_ID, AUDIT2_ID, INNOVA_ID, TEST_ID,
         'damaged', 'Bumper damaged during parking.',
         _dt('2026-07-11 12:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 12:00:00+00')),

        (ITEM6_ID, AUDIT2_ID, PROJECTOR_ID, RAJ_ID,
         'verified', 'All cables present and bulb working well.',
         _dt('2026-07-11 12:30:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 12:30:00+00')),

        (ITEM7_ID, AUDIT2_ID, DESK_ID, TEST_ID,
         'verified', 'Desk in good condition.',
         _dt('2026-07-11 13:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 13:00:00+00')),

        (ITEM8_ID, AUDIT2_ID, CHAIR_ID, RAJ_ID,
         'pending', None,
         None, _dt('2026-07-01 09:00:00+00'), _dt('2026-07-01 09:00:00+00')),

        (ITEM9_ID, AUDIT2_ID, PRINTER_ID, TEST_ID,
         'verified', 'Printer toner might need replacement soon.',
         _dt('2026-07-11 14:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 14:00:00+00')),

        (ITEM10_ID, AUDIT2_ID, SURFACE_ID, RAJ_ID,
         'missing', 'Surface Pro not on desk. Checking with Ankit.',
         _dt('2026-07-11 14:30:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 14:30:00+00')),

        (ITEM11_ID, AUDIT2_ID, FORD_ID, TEST_ID,
         'verified', 'Van parked in designated spot.',
         _dt('2026-07-11 15:00:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 15:00:00+00')),

        (ITEM12_ID, AUDIT2_ID, IPAD_ID, RAJ_ID,
         'verified', 'iPad locked in conference room A.',
         _dt('2026-07-11 15:30:00+00'), _dt('2026-07-01 09:00:00+00'), _dt('2026-07-11 15:30:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO audit_items
               (id, cycle_id, asset_id, auditor_id, status, notes, verified_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _notifications(conn: asyncpg.Connection) -> None:
    # (id, employee_id, type, title, message, is_read, entity_type, entity_id, ts)
    rows = [
        (NOTIF1_ID, TEST_ID,  'asset_assigned',
         'MacBook Pro 14" Assigned to You',
         'Asset AF-0001 has been allocated to you. Expected return date: 15 Aug 2026.',
         False, 'allocation', ALLOC1_ID,
         _dt('2026-07-05 09:00:00+00')),

        (NOTIF2_ID, TEST_ID,  'booking_confirmed',
         'Booking Confirmed — iPad Pro 12.9"',
         'Your booking of AF-0012 on 14 Jul 2026, 10:00-11:00 AM is confirmed.',
         False, 'booking', BOOKING3_ID,
         _dt('2026-07-12 08:00:00+00')),

        (NOTIF3_ID, TEST_ID,  'overdue_return',
         'Overdue Return Alert',
         'Asset AF-0009 (Surface Pro 9) allocated to Ankit Verma was due on 30 Jun 2026 and has not been returned.',
         True, 'allocation', ALLOC4_ID,
         _dt('2026-07-01 08:00:00+00')),

        (NOTIF4_ID, RAJ_ID,   'asset_assigned',
         'iPhone 14 Pro Assigned to You',
         'Asset AF-0003 has been allocated to you. Expected return date: 1 Sep 2026.',
         True, 'allocation', ALLOC2_ID,
         _dt('2026-07-05 09:15:00+00')),

        (NOTIF5_ID, RAJ_ID,   'booking_confirmed',
         'Booking Confirmed — Epson Projector',
         'Your booking of AF-0007 on 13 Jul 2026, 09:00-11:00 AM is confirmed.',
         False, 'booking', BOOKING1_ID,
         _dt('2026-07-11 10:00:00+00')),

        (NOTIF6_ID, ADMIN_ID, 'maintenance_raised',
         'Maintenance Request: MacBook Pro 14"',
         'test user raised a MEDIUM priority maintenance request for AF-0001. Please review and approve.',
         False, 'maintenance', MAINT2_ID,
         _dt('2026-07-11 15:00:00+00')),

        (NOTIF7_ID, MGR_ID,   'transfer_requested',
         'Transfer Request: iPhone 14 Pro (AF-0003)',
         'test user has requested transfer of AF-0003 from Raj Kumar. Please review.',
         False, 'transfer', TRANSFER1_ID,
         _dt('2026-07-10 11:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO notifications
               (id, employee_id, type, title, message, is_read,
                entity_type, entity_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _activity_logs(conn: asyncpg.Connection) -> None:
    rows = [
        (LOG1_ID, MGR_ID,    'asset_created',      'asset',       MACBOOK_ID,
         json.dumps({'asset_tag': 'AF-0001', 'name': 'MacBook Pro 14"', 'category': 'Electronics'}),
         _dt('2026-07-03 08:05:00+00')),

        (LOG2_ID, MGR_ID,    'asset_allocated',    'allocation',  ALLOC1_ID,
         json.dumps({'asset': 'MacBook Pro 14"', 'allocated_to': 'test user', 'expected_return': '2026-08-15'}),
         _dt('2026-07-05 09:00:00+00')),

        (LOG3_ID, MGR_ID,    'asset_allocated',    'allocation',  ALLOC2_ID,
         json.dumps({'asset': 'iPhone 14 Pro', 'allocated_to': 'Raj Kumar', 'expected_return': '2026-09-01'}),
         _dt('2026-07-05 09:15:00+00')),

        (LOG4_ID, ADMIN_ID,  'audit_cycle_created','audit_cycle', AUDIT2_ID,
         json.dumps({'name': 'Q3 2026 Full Organisation Audit', 'start': '2026-07-01', 'end': '2026-09-30'}),
         _dt('2026-07-01 09:00:00+00')),

        (LOG5_ID, TEST_ID,   'maintenance_raised', 'maintenance', MAINT2_ID,
         json.dumps({'asset': 'MacBook Pro 14"', 'asset_tag': 'AF-0001', 'priority': 'medium'}),
         _dt('2026-07-11 15:00:00+00')),

        (LOG6_ID, TEST_ID,   'transfer_requested', 'transfer',    TRANSFER1_ID,
         json.dumps({'asset': 'iPhone 14 Pro', 'asset_tag': 'AF-0003', 'from': 'Raj Kumar'}),
         _dt('2026-07-10 11:00:00+00')),
    ]
    await conn.executemany(
        """INSERT INTO activity_logs
               (id, employee_id, action, entity_type, entity_id, details, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$7)
           ON CONFLICT DO NOTHING""",
        rows,
    )


async def _cleanup(conn: asyncpg.Connection) -> None:
    # Wipe all non-user data so re-runs are always clean
    await conn.execute("DELETE FROM activity_logs")
    await conn.execute("DELETE FROM notifications")
    await conn.execute("DELETE FROM audit_items")
    await conn.execute("DELETE FROM audit_assignments")
    await conn.execute("DELETE FROM audit_cycles")
    await conn.execute("DELETE FROM maintenance_requests")
    await conn.execute("DELETE FROM bookings")
    await conn.execute("DELETE FROM transfer_requests")
    await conn.execute("DELETE FROM allocations")
    await conn.execute("DELETE FROM assets")
    await conn.execute("DELETE FROM asset_categories")
    # Break circular FK (employees ↔ departments) before deleting
    await conn.execute("UPDATE departments SET head_id = NULL")
    await conn.execute(
        "UPDATE employees SET department_id = NULL WHERE id != $1 AND id != $2",
        ADMIN_ID, TEST_ID,
    )
    await conn.execute("DELETE FROM departments")
    await conn.execute(
        "DELETE FROM employees WHERE id != $1 AND id != $2",
        ADMIN_ID, TEST_ID,
    )
    # Reset admin/test department link to start clean
    await conn.execute(
        "UPDATE employees SET department_id = NULL WHERE id = ANY($1::uuid[])",
        [ADMIN_ID, TEST_ID],
    )


async def seed() -> None:
    url = _load_db_url()
    conn = await asyncpg.connect(dsn=url, ssl='require')
    try:
        async with conn.transaction():
            await _cleanup(conn)
            await _employees(conn)
            await _departments(conn)
            await _categories(conn)
            await _assets(conn)
            await _allocations(conn)
            await _transfers(conn)
            await _bookings(conn)
            await _maintenance(conn)
            await _audit_cycles(conn)
            await _audit_assignments(conn)
            await _audit_items(conn)
            await _notifications(conn)
            await _activity_logs(conn)
        print('[OK] Seed complete.')
        print('  6 employees  |  4 departments  |  4 categories  |  12 assets')
        print('  5 allocations (3 active, 1 overdue, 1 returned)')
        print('  1 transfer   |  3 bookings    |  3 maintenance |  2 audit cycles')
        print('  7 notifications  |  6 activity logs')
        print()
        print('All new employee passwords: Admin@1234')
    except Exception as exc:
        print(f'[FAIL] Seed failed: {exc}')
        raise
    finally:
        await conn.close()


if __name__ == '__main__':
    asyncio.run(seed())
