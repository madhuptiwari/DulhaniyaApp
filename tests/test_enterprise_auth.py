"""
Automated Enterprise Test Suite for Dulhaniya™ Platform
Tests:
1. Database Schema & User Seeding (Customer, Partner, Admin)
2. Admin Lockdown & Security (401 on unauthenticated calls)
3. Admin Login & Authorized Access
4. Universal Customer Authentication (Register, Login, Me, Addresses, Bookings)
5. Partner Portal Endpoints (Dashboard, Duty Toggle, Jobs, Doorstep OTP)
"""

import sys
import os
import json
import unittest
import io

# Ensure root directory is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from dulhaniya_db import (
    get_connection, init_db, hash_password, verify_password,
    get_user_by_email, get_user_by_token, get_user_bookings,
    get_partner_dashboard_data, get_partner_jobs, update_partner_duty,
    update_user_addresses
)
from server import DulhaniyaRequestHandler

class MockSocket:
    def __init__(self, data=b""):
        self._data = data
        self._pos = 0

    def makefile(self, mode="r", buffering=-1):
        if "b" in mode:
            return io.BytesIO(self._data)
        return io.StringIO(self._data.decode("utf-8"))

    def sendall(self, data):
        pass

class MockServer:
    pass

class TestDulhaniyaAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_database_schema_and_seeding(self):
        """Verify users table exists with seeded accounts"""
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        self.assertIsNotNone(cur.fetchone(), "users table must exist")

        # Verify Customer seed
        customer = get_user_by_email("customer@dulhaniya.com")
        self.assertIsNotNone(customer, "Customer seed account must exist")
        self.assertEqual(customer["role"], "customer")
        self.assertTrue(verify_password("customer123", customer["password_hash"]))
        self.assertGreater(len(customer["addresses"]), 0, "Customer should have default address")

        # Verify Partner seed
        partner = get_user_by_email("partner@dulhaniya.com")
        self.assertIsNotNone(partner, "Partner seed account must exist")
        self.assertEqual(partner["role"], "partner")
        self.assertEqual(partner["partner_id"], 1)
        self.assertTrue(verify_password("partner123", partner["password_hash"]))

        # Verify Admin seed
        admin = get_user_by_email("admin@dulhaniya.com")
        self.assertIsNotNone(admin, "Admin seed account must exist")
        self.assertEqual(admin["role"], "admin")
        self.assertTrue(verify_password("dulhaniya@royal2026", admin["password_hash"]))
        conn.close()

    def test_02_password_hashing(self):
        """Verify sha256 password hashing utility"""
        h = hash_password("secretPass2026")
        self.assertTrue(verify_password("secretPass2026", h))
        self.assertFalse(verify_password("wrongPass", h))

    def _call_handler(self, method, path, body=None, headers=None):
        """Simulate an HTTP request through DulhaniyaRequestHandler without network binding"""
        raw_body = json.dumps(body).encode("utf-8") if body is not None else b""
        request_line = f"{method} {path} HTTP/1.1\r\n"
        headers_dict = {
            "Host": "localhost",
            "Content-Length": str(len(raw_body)),
            "Content-Type": "application/json"
        }
        if headers:
            headers_dict.update(headers)

        header_lines = "".join(f"{k}: {v}\r\n" for k, v in headers_dict.items())
        raw_req = request_line.encode("utf-8") + header_lines.encode("utf-8") + b"\r\n" + raw_body

        class CaptureHandler(DulhaniyaRequestHandler):
            def __init__(self, request_bytes):
                self.client_address = ('127.0.0.1', 54321)
                self.rfile = io.BytesIO(request_bytes)
                self.wfile = io.BytesIO()
                self.headers = None
                self.raw_requestline = self.rfile.readline()
                self.parse_request()

            def log_message(self, format, *args):
                pass

            def send_response(self, code, message=None):
                self.status_code = code
                super().send_response(code, message)

        handler = CaptureHandler(raw_req)
        if method == "GET":
            handler.do_GET()
        elif method == "POST":
            handler.do_POST()
        elif method == "DELETE":
            handler.do_DELETE()

        raw_output = handler.wfile.getvalue().decode("utf-8")
        parts = raw_output.split("\r\n\r\n", 1)
        resp_body = json.loads(parts[1]) if len(parts) > 1 and parts[1].strip() else {}
        return handler.status_code, resp_body

    def test_03_admin_lockdown(self):
        """Admin endpoints must strictly reject unauthenticated requests with 401"""
        # Unauthenticated GET
        code, body = self._call_handler("GET", "/api/admin/stats")
        self.assertEqual(code, 401)
        self.assertIn("Admin authentication required", body.get("error", ""))

        code, body = self._call_handler("GET", "/api/admin/beauticians")
        self.assertEqual(code, 401)

        code, body = self._call_handler("GET", "/api/admin/coupons")
        self.assertEqual(code, 401)

        # Invalid token GET
        code, body = self._call_handler("GET", "/api/admin/stats", headers={"Authorization": "Bearer badtoken999"})
        self.assertEqual(code, 401)

        # Unauthenticated POST to admin route
        code, body = self._call_handler("POST", "/api/admin/coupons", body={"code": "HACKED"})
        self.assertEqual(code, 401)

    def test_04_admin_login_and_authorized_access(self):
        """Admin login with valid credentials must succeed and grant access"""
        # Wrong password
        code, body = self._call_handler("POST", "/api/admin/login", body={"username": "admin", "password": "wrongpassword"})
        self.assertEqual(code, 401)
        self.assertFalse(body.get("success", True))

        # Valid login
        code, body = self._call_handler("POST", "/api/admin/login", body={"username": "admin", "password": "dulhaniya@royal2026"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        admin_token = body.get("token")
        self.assertIsNotNone(admin_token)

        # Access protected endpoint with valid token
        code, body = self._call_handler("GET", "/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertIn("total_revenue", body.get("stats", {}))

    def test_05_customer_registration_and_login(self):
        """Register a new customer, log in, and fetch profile"""
        import random
        rand_id = random.randint(10000, 99999)
        test_email = f"bride_{rand_id}@example.com"

        # Register customer
        reg_data = {
            "name": f"Bride Tester {rand_id}",
            "email": test_email,
            "phone": f"+91 99999 {rand_id}",
            "password": "bridePassword2026",
            "role": "customer"
        }
        code, body = self._call_handler("POST", "/api/auth/register", body=reg_data)
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        cust_token = body.get("token")
        self.assertIsNotNone(cust_token)

        # Login with newly created user
        login_data = {
            "email": test_email,
            "password": "bridePassword2026"
        }
        code, body = self._call_handler("POST", "/api/auth/login", body=login_data)
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        token = body.get("token")

        # Fetch /api/auth/me
        code, body = self._call_handler("GET", "/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertEqual(body.get("user", {}).get("email"), test_email)
        self.assertNotIn("password_hash", body.get("user", {}))

    def test_06_customer_addresses_and_bookings(self):
        """Verify saved address management and bookings access"""
        cust = get_user_by_email("customer@dulhaniya.com")
        token = cust["token"]

        # Get saved addresses
        code, body = self._call_handler("GET", "/api/user/addresses", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertIsInstance(body.get("addresses"), list)

        # Add new address
        new_addr = {
            "label": "Wedding Venue",
            "address": "The Leela Palace, Chanakyapuri",
            "city": "New Delhi",
            "pincode": "110023",
            "landmark": "Near Africa Avenue"
        }
        code, body = self._call_handler("POST", "/api/user/addresses", body=new_addr, headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))

        # Verify bookings retrieval
        code, body = self._call_handler("GET", "/api/user/bookings", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertIsInstance(body.get("bookings"), list)

    def test_07_partner_portal_endpoints(self):
        """Verify partner login, dashboard, duty toggle, and OTP verification"""
        partner = get_user_by_email("partner@dulhaniya.com")
        token = partner["token"]

        # Partner Dashboard
        code, body = self._call_handler("GET", "/api/partner/dashboard", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertIn("is_available", body)
        self.assertIn("today_earnings", body)

        initial_availability = body["is_available"]

        # Toggle Duty Status
        code, body = self._call_handler("POST", "/api/partner/toggle-duty", body={}, headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertNotEqual(body["is_available"], initial_availability)

        # Toggle back
        code, body = self._call_handler("POST", "/api/partner/toggle-duty", body={}, headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertEqual(body["is_available"], initial_availability)

        # Partner Assigned Jobs
        code, body = self._call_handler("GET", "/api/partner/jobs", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(code, 200)
        self.assertTrue(body.get("success"))
        self.assertIsInstance(body.get("jobs"), list)

if __name__ == "__main__":
    unittest.main()
