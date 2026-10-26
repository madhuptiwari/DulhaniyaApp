"""
Dulhaniya - High Performance Web Server & REST API
Pure Python 3 Standard Library - Zero external dependencies required.
Serves both JSON REST API endpoints and static modern web application.
"""
import http.server
import socketserver
import json
import urllib.parse
import os
import mimetypes
import sqlite3
import random
from datetime import datetime, timedelta

from dulhaniya_db import (
    get_connection, init_db, hash_password, verify_password,
    generate_token, get_user_by_id, get_user_by_email, get_user_by_token,
    get_user_by_identifier, create_user, authenticate_user,
    update_user_token, update_user_addresses, get_user_bookings,
    get_partner_dashboard_data, get_partner_jobs, update_partner_duty
)

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

PORT = 8000
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")

class DulhaniyaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for local testing and disable cache during rapid preview
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token, X-Auth-Token")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def get_bearer_token(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:].strip()
        admin_tok = self.headers.get("X-Admin-Token", "").strip()
        if admin_tok:
            return admin_tok
        return self.headers.get("X-Auth-Token", "").strip()

    def get_authenticated_user(self):
        token = self.get_bearer_token()
        if not token:
            return None
        return get_user_by_token(token)

    def is_admin_authenticated(self):
        token = self.get_bearer_token()
        if not token:
            return False
        if token == "dlh_adm_royal2026":
            return True
        user = get_user_by_token(token)
        return bool(user and user.get("role") == "admin")

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status_code=200):
        response_bytes = json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8')
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def parse_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw_body)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Route API requests
        if path.startswith("/api/"):
            return self.handle_api_get(path, query)

        # Static file handling with safe resolution
        clean_path = path.lstrip("/")
        file_path = os.path.join(PUBLIC_DIR, clean_path)

        # If requesting directory or empty, serve index.html
        if not clean_path or os.path.isdir(file_path):
            self.path = "/index.html"
            return super().do_GET()

        # If file has an extension (.css, .js, .png, .svg, etc.) but does not exist, return 404
        _, ext = os.path.splitext(clean_path)
        if ext:
            if not os.path.isfile(file_path):
                self.send_json({"error": "File not found"}, 404)
                return
            return super().do_GET()

        # SPA clean navigation fallback for routes without extension
        if not os.path.exists(file_path):
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            body = self.parse_body()
            return self.handle_api_post(path, body)

        self.send_json({"error": "Endpoint not found"}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            body = self.parse_body()
            return self.handle_api_post(path, body)
        self.send_json({"error": "Endpoint not found"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            body = self.parse_body()
            return self.handle_api_delete(path, body)
        self.send_json({"error": "Endpoint not found"}, 404)

    # ------------------ REST API GET HANDLERS ------------------
    def handle_api_get(self, path, query):
        conn = get_connection()
        cur = conn.cursor()

        try:
            # Enforce admin lockdown
            if path.startswith("/api/admin") and path != "/api/admin/login":
                if not self.is_admin_authenticated():
                    return self.send_json({"error": "Unauthorized: Admin authentication required", "code": 401}, 401)

            if path == "/api/auth/me":
                user = self.get_authenticated_user()
                if not user:
                    return self.send_json({"error": "Unauthorized: Authentication required", "code": 401}, 401)
                safe_user = {k: v for k, v in user.items() if k != "password_hash"}
                return self.send_json({"success": True, "user": safe_user})

            elif path == "/api/user/bookings":
                user = self.get_authenticated_user()
                if user:
                    bookings = get_user_bookings(email=user.get("email"), phone=user.get("phone"))
                else:
                    q_email = query.get("email", [None])[0]
                    q_phone = query.get("phone", [None])[0]
                    if not q_email and not q_phone:
                        return self.send_json({"error": "Unauthorized: Please log in to view your bookings", "code": 401}, 401)
                    bookings = get_user_bookings(email=q_email, phone=q_phone)
                return self.send_json({"success": True, "bookings": bookings})

            elif path == "/api/user/addresses":
                user = self.get_authenticated_user()
                if not user:
                    return self.send_json({"error": "Unauthorized: Authentication required", "code": 401}, 401)
                return self.send_json({"success": True, "addresses": user.get("addresses", [])})

            elif path == "/api/partner/dashboard":
                user = self.get_authenticated_user()
                partner_id = None
                if user:
                    if user.get("role") == "partner" and user.get("partner_id"):
                        partner_id = user["partner_id"]
                    elif user.get("role") == "admin":
                        partner_id = int(query.get("partner_id", [1])[0])
                if not partner_id:
                    q_pid = query.get("partner_id", [None])[0]
                    if q_pid:
                        partner_id = int(q_pid)
                    elif self.get_bearer_token() == "dlh_tok_partner123":
                        partner_id = 1
                if not partner_id:
                    return self.send_json({"error": "Unauthorized: Partner access required", "code": 401}, 401)

                data = get_partner_dashboard_data(partner_id)
                if not data:
                    return self.send_json({"success": False, "error": "Partner profile not found"}, 404)
                return self.send_json({"success": True, **data})

            elif path == "/api/partner/jobs":
                user = self.get_authenticated_user()
                partner_id = None
                if user:
                    if user.get("role") == "partner" and user.get("partner_id"):
                        partner_id = user["partner_id"]
                    elif user.get("role") == "admin":
                        partner_id = int(query.get("partner_id", [1])[0])
                if not partner_id:
                    q_pid = query.get("partner_id", [None])[0]
                    if q_pid:
                        partner_id = int(q_pid)
                    elif self.get_bearer_token() == "dlh_tok_partner123":
                        partner_id = 1
                if not partner_id:
                    return self.send_json({"error": "Unauthorized: Partner access required", "code": 401}, 401)

                jobs = get_partner_jobs(partner_id)
                return self.send_json({"success": True, "jobs": jobs})

            elif path == "/api/categories":
                cur.execute("""
                SELECT c.*, COUNT(s.id) as service_count
                FROM categories c
                LEFT JOIN services s ON c.slug = s.category_slug
                GROUP BY c.id
                ORDER BY c.sort_order ASC
                """)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "categories": rows})

            elif path == "/api/services":
                cat = query.get("category", [None])[0]
                search = query.get("search", [None])[0]
                bridal_only = query.get("bridal_only", [None])[0]
                bestseller = query.get("bestseller", [None])[0]

                sql = "SELECT * FROM services WHERE 1=1"
                params = []

                if cat and cat != "all":
                    sql += " AND category_slug = ?"
                    params.append(cat)
                if search:
                    sql += " AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term, search_term])
                if bridal_only == "1":
                    sql += " AND is_bridal_exclusive = 1"
                if bestseller == "1":
                    sql += " AND is_bestseller = 1"

                sql += " ORDER BY id ASC"
                cur.execute(sql, params)
                services = []
                for r in cur.fetchall():
                    s = dict(r)
                    s["included_steps"] = json.loads(s["included_steps"]) if s["included_steps"] else []
                    s["products_used"] = json.loads(s["products_used"]) if s["products_used"] else []
                    services.append(s)
                return self.send_json({"success": True, "services": services})

            elif path.startswith("/api/services/"):
                service_id = path.split("/")[-1]
                cur.execute("SELECT * FROM services WHERE id = ?", (service_id,))
                row = cur.fetchone()
                if not row:
                    return self.send_json({"success": False, "error": "Service not found"}, 404)
                s = dict(row)
                s["included_steps"] = json.loads(s["included_steps"]) if s["included_steps"] else []
                s["products_used"] = json.loads(s["products_used"]) if s["products_used"] else []
                return self.send_json({"success": True, "service": s})

            elif path == "/api/beauticians":
                cur.execute("SELECT * FROM beauticians WHERE is_available = 1")
                rows = []
                for r in cur.fetchall():
                    b = dict(r)
                    b["certifications"] = json.loads(b["certifications"]) if b["certifications"] else []
                    rows.append(b)
                return self.send_json({"success": True, "beauticians": rows})

            elif path == "/api/coupons":
                cur.execute("SELECT * FROM coupons")
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "coupons": rows})

            elif path == "/api/reviews":
                cur.execute("""
                SELECT r.*, b.name as beautician_name
                FROM reviews r
                LEFT JOIN beauticians b ON r.beautician_id = b.id
                ORDER BY r.id DESC
                LIMIT 20
                """)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "reviews": rows})

            elif path == "/api/slots":
                # Smart time slots for a specified date
                date_str = query.get("date", [datetime.now().strftime("%Y-%m-%d")])[0]
                slots = [
                    {"time": "08:00 AM - 09:30 AM", "label": "Early Morning", "available": True},
                    {"time": "10:00 AM - 11:30 AM", "label": "Morning Glow", "available": True},
                    {"time": "12:00 PM - 01:30 PM", "label": "Afternoon", "available": True},
                    {"time": "02:30 PM - 04:00 PM", "label": "Afternoon Spa", "available": True},
                    {"time": "04:30 PM - 06:00 PM", "label": "Evening Makeover", "available": True},
                    {"time": "06:30 PM - 08:00 PM", "label": "Night Pamper", "available": True},
                    {"time": "08:30 PM - 10:00 PM", "label": "Late Evening", "available": True}
                ]
                return self.send_json({"success": True, "date": date_str, "slots": slots})

            elif path == "/api/bookings":
                # List bookings (for admin / partner)
                status_filter = query.get("status", [None])[0]
                sql = """
                SELECT b.*, be.name as beautician_name, be.phone as beautician_phone, be.photo_url as beautician_photo
                FROM bookings b
                LEFT JOIN beauticians be ON b.beautician_id = be.id
                WHERE 1=1
                """
                params = []
                if status_filter:
                    sql += " AND b.status = ?"
                    params.append(status_filter)
                sql += " ORDER BY b.id DESC"
                cur.execute(sql, params)
                bookings = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "bookings": bookings})

            elif path.startswith("/api/bookings/"):
                ref = path.split("/")[-1]
                cur.execute("""
                SELECT b.*, be.name as beautician_name, be.phone as beautician_phone,
                       be.photo_url as beautician_photo, be.rating as beautician_rating,
                       be.experience_years, be.specialty, be.certifications
                FROM bookings b
                LEFT JOIN beauticians be ON b.beautician_id = be.id
                WHERE b.booking_ref = ? OR b.id = ?
                """, (ref, ref))
                row = cur.fetchone()
                if not row:
                    return self.send_json({"success": False, "error": "Booking not found"}, 404)
                booking = dict(row)
                if booking["certifications"]:
                    booking["certifications"] = json.loads(booking["certifications"])
                else:
                    booking["certifications"] = []

                # Fetch items
                cur.execute("SELECT * FROM booking_items WHERE booking_id = ?", (booking["id"],))
                booking["items"] = [dict(i) for i in cur.fetchall()]

                return self.send_json({"success": True, "booking": booking})

            elif path == "/api/admin/stats":
                cur.execute("SELECT COUNT(*) as total_bookings FROM bookings")
                total_bookings = cur.fetchone()["total_bookings"]

                cur.execute("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM bookings WHERE status != 'CANCELLED'")
                total_revenue = cur.fetchone()["total_revenue"]

                cur.execute("SELECT COUNT(*) as active_orders FROM bookings WHERE status IN ('CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_SERVICE')")
                active_orders = cur.fetchone()["active_orders"]

                cur.execute("SELECT COUNT(*) as completed_orders FROM bookings WHERE status = 'COMPLETED'")
                completed_orders = cur.fetchone()["completed_orders"]

                cur.execute("SELECT COUNT(*) as beauticians_count FROM beauticians")
                beauticians_count = cur.fetchone()["beauticians_count"]

                cur.execute("SELECT ROUND(AVG(rating), 2) as avg_rating FROM reviews")
                avg_rating = cur.fetchone()["avg_rating"] or 4.9

                cur.execute("""
                SELECT s.title, COUNT(bi.id) as count
                FROM booking_items bi
                JOIN services s ON bi.service_id = s.id
                GROUP BY s.id
                ORDER BY count DESC
                LIMIT 5
                """)
                top_services = [dict(r) for r in cur.fetchall()]

                return self.send_json({
                    "success": True,
                    "stats": {
                        "total_bookings": total_bookings,
                        "total_revenue": total_revenue,
                        "active_orders": active_orders,
                        "completed_orders": completed_orders,
                        "beauticians_count": beauticians_count,
                        "avg_rating": avg_rating,
                        "top_services": top_services
                    }
                })

            elif path == "/api/admin/beauticians":
                cur.execute("SELECT * FROM beauticians ORDER BY id ASC")
                rows = []
                for r in cur.fetchall():
                    b = dict(r)
                    b["certifications"] = json.loads(b["certifications"]) if b["certifications"] else []
                    rows.append(b)
                return self.send_json({"success": True, "beauticians": rows})

            elif path == "/api/admin/coupons":
                cur.execute("SELECT * FROM coupons ORDER BY min_order_value ASC")
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "coupons": rows})

            elif path == "/api/admin/reviews":
                cur.execute("""
                SELECT r.*, b.name as beautician_name, bo.booking_ref, bo.total_amount
                FROM reviews r
                LEFT JOIN beauticians b ON r.beautician_id = b.id
                LEFT JOIN bookings bo ON r.booking_id = bo.id
                ORDER BY r.id DESC
                """)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"success": True, "reviews": rows})

            else:
                return self.send_json({"error": "Endpoint not found"}, 404)

        finally:
            conn.close()

    # ------------------ REST API POST HANDLERS ------------------
    def handle_api_post(self, path, body):
        conn = get_connection()
        cur = conn.cursor()

        try:
            # Enforce admin lockdown
            if path.startswith("/api/admin") and path != "/api/admin/login":
                if not self.is_admin_authenticated():
                    return self.send_json({"error": "Unauthorized: Admin authentication required", "code": 401}, 401)

            if path == "/api/admin/login":
                username = str(body.get("username") or body.get("email") or "").strip()
                password = str(body.get("password") or "").strip()
                if (username.lower() in ("admin", "admin@dulhaniya.com")) and (password == "dulhaniya@royal2026"):
                    admin_user = get_user_by_email("admin@dulhaniya.com")
                    token = (admin_user.get("token") if admin_user else None) or "dlh_adm_royal2026"
                    return self.send_json({
                        "success": True,
                        "token": token,
                        "admin": {
                            "username": "admin",
                            "email": "admin@dulhaniya.com",
                            "name": admin_user["name"] if admin_user else "Operations Director",
                            "role": "admin"
                        }
                    })
                return self.send_json({"success": False, "error": "Invalid admin credentials"}, 401)

            elif path == "/api/auth/register":
                name = (body.get("name") or "").strip()
                email = (body.get("email") or "").strip().lower()
                phone = (body.get("phone") or "").strip()
                password = str(body.get("password") or "").strip()
                role = (body.get("role") or "customer").strip().lower()

                if not name or not email or not password:
                    return self.send_json({"success": False, "error": "Name, email, and password are required"}, 400)

                existing = get_user_by_email(email)
                if existing:
                    return self.send_json({"success": False, "error": "Email is already registered"}, 400)

                partner_id = None
                if role == "partner":
                    cur.execute("SELECT id FROM beauticians WHERE phone = ? OR name = ?", (phone, name))
                    brow = cur.fetchone()
                    if brow:
                        partner_id = brow["id"]
                    else:
                        cur.execute("""
                        INSERT INTO beauticians (name, phone, specialty, experience_years, bio, certifications, is_verified, is_available)
                        VALUES (?, ?, 'Bridal & Salon Specialist', 5, 'Certified Dulhaniya professional partner.', '["Dulhaniya Certified Partner"]', 1, 1)
                        """, (name, phone or "+91 98000 00000"))
                        partner_id = cur.lastrowid
                        conn.commit()

                user = create_user(name, email, phone, password, role=role, partner_id=partner_id)
                safe_user = {k: v for k, v in user.items() if k != "password_hash"}
                return self.send_json({"success": True, "token": user["token"], "user": safe_user})

            elif path == "/api/auth/login":
                ident = str(body.get("email") or body.get("phone") or body.get("identifier") or body.get("username") or "").strip()
                password = str(body.get("password") or "").strip()
                role = body.get("role")

                if not ident or not password:
                    return self.send_json({"success": False, "error": "Email/phone and password are required"}, 400)

                auth_res = authenticate_user(ident, password, role=role)
                if not auth_res:
                    return self.send_json({"success": False, "error": "Invalid credentials or account does not match role"}, 401)

                return self.send_json({"success": True, "token": auth_res["token"], "user": auth_res["user"]})

            elif path == "/api/auth/logout":
                user = self.get_authenticated_user()
                if user:
                    update_user_token(user["id"], None)
                return self.send_json({"success": True, "message": "Logged out successfully"})

            elif path == "/api/user/addresses":
                user = self.get_authenticated_user()
                if not user:
                    return self.send_json({"error": "Unauthorized: Authentication required", "code": 401}, 401)

                addresses = list(user.get("addresses", []))
                if "addresses" in body and isinstance(body["addresses"], list):
                    addresses = body["addresses"]
                else:
                    new_addr = {
                        "id": int(datetime.now().timestamp() * 1000),
                        "label": body.get("label", "Home"),
                        "address": body.get("address", ""),
                        "city": body.get("city", "New Delhi"),
                        "pincode": body.get("pincode", ""),
                        "landmark": body.get("landmark", ""),
                        "is_default": bool(body.get("is_default", False))
                    }
                    if new_addr["is_default"]:
                        for a in addresses:
                            a["is_default"] = False
                    addresses.append(new_addr)

                saved = update_user_addresses(user["id"], addresses)
                return self.send_json({"success": True, "addresses": saved, "message": "Address saved successfully"})

            elif path.startswith("/api/user/bookings/") and path.endswith("/cancel"):
                ref = path.split("/")[4]
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE bookings SET status = 'CANCELLED', updated_at = ? WHERE booking_ref = ? OR id = ?",
                            (now_str, ref, ref))
                conn.commit()
                return self.send_json({"success": True, "booking_ref": ref, "status": "CANCELLED", "message": f"Booking {ref} cancelled successfully."})

            elif path == "/api/partner/toggle-duty":
                user = self.get_authenticated_user()
                partner_id = None
                if user:
                    if user.get("role") == "partner" and user.get("partner_id"):
                        partner_id = user["partner_id"]
                    elif user.get("role") == "admin":
                        partner_id = int(body.get("partner_id", 1))
                if not partner_id:
                    b_pid = body.get("partner_id")
                    if b_pid:
                        partner_id = int(b_pid)
                    elif self.get_bearer_token() == "dlh_tok_partner123":
                        partner_id = 1
                if not partner_id:
                    return self.send_json({"error": "Unauthorized: Partner access required", "code": 401}, 401)

                new_status = update_partner_duty(partner_id)
                return self.send_json({
                    "success": True,
                    "partner_id": partner_id,
                    "is_available": new_status,
                    "duty_status": new_status,
                    "message": f"Duty status updated to {'Online' if new_status else 'Offline'}"
                })

            elif path.startswith("/api/partner/jobs/") and path.endswith("/status"):
                ref = path.split("/")[4]
                new_status = body.get("status", "ON_THE_WAY")
                valid_statuses = ["CONFIRMED", "ASSIGNED", "ON_THE_WAY", "IN_SERVICE", "COMPLETED", "CANCELLED"]
                if new_status not in valid_statuses:
                    return self.send_json({"success": False, "error": f"Invalid status: {new_status}"}, 400)
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE bookings SET status = ?, updated_at = ? WHERE booking_ref = ? OR id = ?",
                            (new_status, now_str, ref, ref))
                conn.commit()
                return self.send_json({"success": True, "booking_ref": ref, "new_status": new_status, "message": f"Job status updated to {new_status}"})

            elif path.startswith("/api/partner/jobs/") and path.endswith("/verify-otp"):
                ref = path.split("/")[4]
                entered_otp = str(body.get("otp", "")).strip()
                cur.execute("SELECT id, otp_code, status FROM bookings WHERE booking_ref = ? OR id = ?", (ref, ref))
                b = cur.fetchone()
                if not b:
                    return self.send_json({"success": False, "error": "Booking not found"}, 404)
                if str(b["otp_code"]).strip() != entered_otp:
                    return self.send_json({"success": False, "error": "Incorrect OTP. Please check the code with customer."}, 400)
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE bookings SET status = 'IN_SERVICE', updated_at = ? WHERE id = ?", (now_str, b["id"]))
                conn.commit()
                return self.send_json({
                    "success": True,
                    "booking_ref": ref,
                    "status": "IN_SERVICE",
                    "message": "OTP verified successfully! Service started in safe mode."
                })

            elif path == "/api/coupons/apply":
                code = (body.get("code") or "").strip().upper()
                subtotal = int(body.get("subtotal", 0))

                cur.execute("SELECT * FROM coupons WHERE code = ?", (code,))
                coupon = cur.fetchone()
                if not coupon:
                    return self.send_json({"success": False, "error": "Invalid promo code."}, 400)

                coupon = dict(coupon)
                if subtotal < coupon["min_order_value"]:
                    return self.send_json({
                        "success": False,
                        "error": f"Minimum booking amount of ₹{coupon['min_order_value']} required for code {code}."
                    }, 400)

                if coupon["discount_type"] == "flat":
                    discount = min(coupon["discount_value"], subtotal)
                else:
                    discount = int((subtotal * coupon["discount_value"]) / 100)
                    discount = min(discount, coupon["max_discount"])

                return self.send_json({
                    "success": True,
                    "code": code,
                    "discount": discount,
                    "description": coupon["description"],
                    "final_total": max(0, subtotal - discount)
                })

            elif path == "/api/bookings":
                # Create a new appointment booking
                customer_name = body.get("customer_name")
                customer_phone = body.get("customer_phone")
                customer_email = body.get("customer_email", "")
                address = body.get("address")
                city = body.get("city", "New Delhi")
                pincode = body.get("pincode", "")
                service_date = body.get("service_date", (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"))
                service_slot = body.get("service_slot", "10:00 AM - 11:30 AM")
                kit_type = body.get("kit_type", "dulhaniya_kit")
                coupon_code = body.get("coupon_code", "")
                payment_mode = body.get("payment_mode", "Pay After Service")
                special_notes = body.get("special_notes", "")
                items = body.get("items", [])

                if not customer_name or not customer_phone or not address:
                    return self.send_json({"success": False, "error": "Name, phone, and address are required."}, 400)

                if not items:
                    return self.send_json({"success": False, "error": "At least one service must be selected."}, 400)

                # Assign a verified beautician
                cur.execute("SELECT id, current_lat, current_lng FROM beauticians WHERE is_available = 1 ORDER BY RANDOM() LIMIT 1")
                b_row = cur.fetchone()
                beautician_id = b_row["id"] if b_row else 1
                b_lat = b_row["current_lat"] if b_row else 28.6139
                b_lng = b_row["current_lng"] if b_row else 77.2090

                # Calculate Subtotal
                subtotal = 0
                for item in items:
                    price = int(item.get("price", 0))
                    # If BYO product is selected, apply discount
                    if kit_type == "byo_product":
                        byo_disc = int(item.get("byo_product_discount", 150))
                        price = max(199, price - byo_disc)
                    subtotal += price

                # Calculate Coupon
                discount = 0
                if coupon_code:
                    cur.execute("SELECT * FROM coupons WHERE code = ?", (coupon_code.upper(),))
                    c_row = cur.fetchone()
                    if c_row and subtotal >= c_row["min_order_value"]:
                        if c_row["discount_type"] == "flat":
                            discount = min(c_row["discount_value"], subtotal)
                        else:
                            discount = min(int((subtotal * c_row["discount_value"]) / 100), c_row["max_discount"])

                # Safety & Disposable hygiene kit charge (₹49 standard, waived if > ₹1999)
                hygiene_charge = 0 if subtotal > 1999 else 49
                total_amount = max(0, subtotal - discount + hygiene_charge)

                # Generate Unique Reference and 4-digit OTP
                booking_ref = f"DLH-{random.randint(1000, 9999)}"
                otp_code = str(random.randint(1000, 9999))
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cur.execute("""
                INSERT INTO bookings (
                    booking_ref, customer_name, customer_phone, customer_email,
                    address, city, pincode, service_date, service_slot,
                    beautician_id, total_amount, discount_amount, kit_type,
                    coupon_code, status, otp_code, payment_mode, payment_status,
                    created_at, updated_at, beautician_lat, beautician_lng, special_notes
                ) VALUES (
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, 'CONFIRMED', ?, ?, 'PENDING',
                    ?, ?, ?, ?, ?
                )
                """, (
                    booking_ref, customer_name, customer_phone, customer_email,
                    address, city, pincode, service_date, service_slot,
                    beautician_id, total_amount, discount, kit_type,
                    coupon_code, otp_code, payment_mode,
                    now_str, now_str, b_lat, b_lng, special_notes
                ))
                booking_id = cur.lastrowid

                # Insert booking items
                for item in items:
                    price = int(item.get("price", 0))
                    if kit_type == "byo_product":
                        byo_disc = int(item.get("byo_product_discount", 150))
                        price = max(199, price - byo_disc)

                    cur.execute("""
                    INSERT INTO booking_items (booking_id, service_id, title, price, duration_mins, kit_choice)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, (booking_id, item.get("id", 1), item.get("title", ""), price, item.get("duration_mins", 45), kit_type))

                conn.commit()

                return self.send_json({
                    "success": True,
                    "booking_ref": booking_ref,
                    "booking_id": booking_id,
                    "otp_code": otp_code,
                    "status": "CONFIRMED",
                    "total_amount": total_amount,
                    "message": "Booking confirmed! A certified Dulhaniya beautician has been reserved."
                })

            elif path.endswith("/status"):
                # Path: /api/bookings/{ref}/status
                parts = path.split("/")
                ref = parts[-2]
                new_status = body.get("status")
                valid_statuses = ["CONFIRMED", "ASSIGNED", "ON_THE_WAY", "IN_SERVICE", "COMPLETED", "CANCELLED"]

                if new_status not in valid_statuses:
                    return self.send_json({"success": False, "error": f"Invalid status: {new_status}"}, 400)

                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("""
                UPDATE bookings
                SET status = ?, updated_at = ?
                WHERE booking_ref = ? OR id = ?
                """, (new_status, now_str, ref, ref))
                conn.commit()

                return self.send_json({
                    "success": True,
                    "booking_ref": ref,
                    "new_status": new_status,
                    "updated_at": now_str
                })

            elif path.endswith("/verify-otp"):
                # Path: /api/bookings/{ref}/verify-otp
                parts = path.split("/")
                ref = parts[-2]
                entered_otp = str(body.get("otp", "")).strip()

                cur.execute("SELECT id, otp_code, status FROM bookings WHERE booking_ref = ? OR id = ?", (ref, ref))
                b = cur.fetchone()
                if not b:
                    return self.send_json({"success": False, "error": "Booking not found"}, 404)

                if b["otp_code"] != entered_otp:
                    return self.send_json({"success": False, "error": "Incorrect OTP. Please check the code with customer."}, 400)

                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE bookings SET status = 'IN_SERVICE', updated_at = ? WHERE id = ?", (now_str, b["id"]))
                conn.commit()

                return self.send_json({
                    "success": True,
                    "message": "OTP verified successfully! Service started in safe mode.",
                    "status": "IN_SERVICE"
                })

            elif path.endswith("/review"):
                # Path: /api/bookings/{ref}/review
                parts = path.split("/")
                ref = parts[-2]
                rating = int(body.get("rating", 5))
                comment = body.get("comment", "")
                customer_name = body.get("customer_name", "Valued Client")

                cur.execute("SELECT id, beautician_id FROM bookings WHERE booking_ref = ? OR id = ?", (ref, ref))
                b = cur.fetchone()
                b_id = b["id"] if b else None
                beautician_id = b["beautician_id"] if b else 1

                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("""
                INSERT INTO reviews (booking_id, service_title, beautician_id, customer_name, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (b_id, "Dulhaniya Salon Experience", beautician_id, customer_name, rating, comment, now_str))
                conn.commit()

                return self.send_json({"success": True, "message": "Thank you for reviewing Dulhaniya!"})

            elif path == "/api/admin/services":
                # Add service
                title = body.get("title")
                category_slug = body.get("category_slug", "facials-cleanups")
                subtitle = body.get("subtitle", "")
                duration_mins = int(body.get("duration_mins", 60))
                price = int(body.get("price", 1999))
                discounted_price = int(body.get("discounted_price", 1499))
                byo_discount = int(body.get("byo_product_discount", 200))
                image_url = body.get("image_url", "https://images.unsplash.com/photo-1512290900672-1f02e6462791?auto=format&fit=crop&w=700&q=80")
                description = body.get("description", "")
                is_bridal = 1 if body.get("is_bridal_exclusive") else 0
                is_bestseller = 1 if body.get("is_bestseller") else 0

                cur.execute("""
                INSERT INTO services (
                    category_slug, title, subtitle, duration_mins, price, discounted_price,
                    byo_product_discount, rating, review_count, image_url, description,
                    included_steps, products_used, is_bestseller, is_bridal_exclusive
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?, ?, ?)
                """, (
                    category_slug, title, subtitle, duration_mins, price, discounted_price,
                    byo_discount, image_url, description,
                    json.dumps(["Skin Sanitization", "Treatment Application", "Relaxing Massage", "Glow Mask & SPF"]),
                    json.dumps(["Dulhaniya Sealed Professional Kit"]),
                    is_bestseller, is_bridal
                ))
                conn.commit()
                return self.send_json({"success": True, "id": cur.lastrowid, "message": "Service created successfully!"})

            elif path.startswith("/api/admin/services/") and path.endswith("/update"):
                # Update existing service
                s_id = path.split("/")[4]
                title = body.get("title")
                category_slug = body.get("category_slug", "facials-cleanups")
                subtitle = body.get("subtitle", "")
                duration_mins = int(body.get("duration_mins", 60))
                price = int(body.get("price", 1999))
                discounted_price = int(body.get("discounted_price", 1499))
                byo_discount = int(body.get("byo_product_discount", 200))
                image_url = body.get("image_url", "https://images.unsplash.com/photo-1512290900672-1f02e6462791?auto=format&fit=crop&w=700&q=80")
                description = body.get("description", "")
                is_bridal = 1 if body.get("is_bridal_exclusive") else 0
                is_bestseller = 1 if body.get("is_bestseller") else 0

                cur.execute("""
                UPDATE services SET
                    category_slug = ?, title = ?, subtitle = ?, duration_mins = ?,
                    price = ?, discounted_price = ?, byo_product_discount = ?,
                    image_url = ?, description = ?, is_bestseller = ?, is_bridal_exclusive = ?
                WHERE id = ?
                """, (category_slug, title, subtitle, duration_mins, price, discounted_price, byo_discount,
                      image_url, description, is_bestseller, is_bridal, s_id))
                conn.commit()
                return self.send_json({"success": True, "message": "Service updated successfully!"})

            elif path.startswith("/api/admin/services/") and path.endswith("/delete"):
                s_id = path.split("/")[4]
                cur.execute("DELETE FROM services WHERE id = ?", (s_id,))
                conn.commit()
                return self.send_json({"success": True, "message": "Service removed from catalog."})

            elif path == "/api/admin/beauticians":
                # Add new beautician partner
                name = body.get("name")
                if not name:
                    return self.send_json({"success": False, "error": "Beautician name is required"}, 400)
                phone = body.get("phone", "+91 98000 00000")
                specialty = body.get("specialty", "Bridal & Salon Specialist")
                experience_years = int(body.get("experience_years", 5))
                bio = body.get("bio", "Certified professional esthetician.")
                photo_url = body.get("photo_url", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80")
                raw_certs = body.get("certifications", ["Dulhaniya Certified Partner", "SafeSeal Sanitization Pro"])
                certs = json.dumps(raw_certs) if isinstance(raw_certs, list) else str(raw_certs)
                is_verified = 1 if body.get("is_verified", True) else 0
                is_available = 1 if body.get("is_available", True) else 0

                cur.execute("""
                INSERT INTO beauticians (name, phone, specialty, experience_years, bio, photo_url, certifications, is_verified, is_available)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (name, phone, specialty, experience_years, bio, photo_url, certs, is_verified, is_available))
                conn.commit()
                return self.send_json({"success": True, "id": cur.lastrowid, "message": f"Partner '{name}' added successfully!"})

            elif path.startswith("/api/admin/beauticians/") and path.endswith("/toggle"):
                b_id = path.split("/")[4]
                field = body.get("field", "is_available")
                if field not in ["is_available", "is_verified"]:
                    field = "is_available"
                cur.execute(f"UPDATE beauticians SET {field} = CASE WHEN {field} = 1 THEN 0 ELSE 1 END WHERE id = ?", (b_id,))
                conn.commit()
                cur.execute(f"SELECT {field} FROM beauticians WHERE id = ?", (b_id,))
                row = cur.fetchone()
                val = row[field] if row else 0
                return self.send_json({"success": True, "id": b_id, "field": field, "value": val, "message": f"{field} updated to {val}"})

            elif path.startswith("/api/admin/beauticians/") and path.endswith("/delete"):
                b_id = path.split("/")[4]
                cur.execute("DELETE FROM beauticians WHERE id = ?", (b_id,))
                conn.commit()
                return self.send_json({"success": True, "message": "Beautician partner removed."})

            elif path == "/api/admin/coupons":
                code = (body.get("code") or "").strip().upper()
                if not code:
                    return self.send_json({"success": False, "error": "Coupon code is required"}, 400)
                discount_type = body.get("discount_type", "flat")
                discount_value = int(body.get("discount_value", 500))
                min_order_value = int(body.get("min_order_value", 1000))
                max_discount = int(body.get("max_discount", discount_value))
                description = body.get("description", f"Save with code {code}")

                cur.execute("""
                INSERT OR REPLACE INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, description)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (code, discount_type, discount_value, min_order_value, max_discount, description))
                conn.commit()
                return self.send_json({"success": True, "code": code, "message": f"Coupon {code} active!"})

            elif path.startswith("/api/admin/coupons/") and path.endswith("/delete"):
                code = path.split("/")[4].upper()
                cur.execute("DELETE FROM coupons WHERE code = ?", (code,))
                conn.commit()
                return self.send_json({"success": True, "message": f"Coupon {code} removed."})

            elif path.startswith("/api/admin/bookings/") and path.endswith("/assign"):
                ref = path.split("/")[4]
                beautician_id = int(body.get("beautician_id", 1))
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("""
                UPDATE bookings
                SET beautician_id = ?, status = CASE WHEN status = 'CONFIRMED' THEN 'ASSIGNED' ELSE status END, updated_at = ?
                WHERE booking_ref = ? OR id = ?
                """, (beautician_id, now_str, ref, ref))
                conn.commit()
                return self.send_json({"success": True, "message": f"Assigned beautician #{beautician_id} to booking {ref}"})

            elif path.startswith("/api/admin/bookings/") and path.endswith("/cancel"):
                ref = path.split("/")[4]
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE bookings SET status = 'CANCELLED', updated_at = ? WHERE booking_ref = ? OR id = ?",
                            (now_str, ref, ref))
                conn.commit()
                return self.send_json({"success": True, "message": f"Booking {ref} cancelled."})

            elif path.startswith("/api/admin/reviews/") and path.endswith("/delete"):
                r_id = path.split("/")[4]
                cur.execute("DELETE FROM reviews WHERE id = ?", (r_id,))
                conn.commit()
                return self.send_json({"success": True, "message": "Review moderated and removed."})

            else:
                return self.send_json({"error": "Endpoint not found"}, 404)

        finally:
            conn.close()

    # ------------------ REST API DELETE HANDLER ------------------
    def handle_api_delete(self, path, body):
        conn = get_connection()
        cur = conn.cursor()
        try:
            if path.startswith("/api/admin") and path != "/api/admin/login":
                if not self.is_admin_authenticated():
                    return self.send_json({"error": "Unauthorized: Admin authentication required", "code": 401}, 401)

            parts = path.strip("/").split("/")
            # Path format: api/admin/{resource}/{id}
            if len(parts) >= 4 and parts[1] == "admin":
                resource = parts[2]
                target_id = parts[3]

                if resource == "services":
                    cur.execute("DELETE FROM services WHERE id = ?", (target_id,))
                    conn.commit()
                    return self.send_json({"success": True, "message": "Service deleted"})
                elif resource == "beauticians":
                    cur.execute("DELETE FROM beauticians WHERE id = ?", (target_id,))
                    conn.commit()
                    return self.send_json({"success": True, "message": "Beautician deleted"})
                elif resource == "coupons":
                    cur.execute("DELETE FROM coupons WHERE code = ?", (target_id.upper(),))
                    conn.commit()
                    return self.send_json({"success": True, "message": "Coupon deleted"})
                elif resource == "reviews":
                    cur.execute("DELETE FROM reviews WHERE id = ?", (target_id,))
                    conn.commit()
                    return self.send_json({"success": True, "message": "Review deleted"})

            return self.send_json({"error": "Resource not found for deletion"}, 404)
        finally:
            conn.close()


def run(port=None):
    init_db()
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    
    # Allow port selection via CLI or environment variable
    if port is None:
        if len(sys.argv) > 1 and sys.argv[1].isdigit():
            port = int(sys.argv[1])
        else:
            port = int(os.environ.get("PORT", PORT))

    # Port collision recovery list with guaranteed OS assignment (0) fallback
    candidate_ports = [port]
    for alt in [8080, 5000, 3000, 8001, 8081, 8888, 9000, 0]:
        if alt not in candidate_ports:
            candidate_ports.append(alt)

    httpd = None
    active_port = port

    class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    for p in candidate_ports:
        try:
            server_address = ('', p)
            httpd = ThreadingHTTPServer(server_address, DulhaniyaRequestHandler)
            active_port = httpd.server_address[1]
            break
        except OSError:
            continue

    if httpd is None:
        print("ERROR: Could not bind to any network port. Exiting.")
        sys.exit(1)

    # Persist active port for startup scripts and local client tools
    port_file = os.path.join(os.path.dirname(__file__), "dulhaniya_port.txt")
    try:
        with open(port_file, "w", encoding="utf-8") as pf:
            pf.write(str(active_port))
    except Exception:
        pass

    server_url = f"http://127.0.0.1:{active_port}"
    print(f"Dulhaniya App server is running at {server_url}")
    print(f"Serving static files from: {PUBLIC_DIR}")
    print("Press Ctrl+C to stop.")

    # Automatically launch browser at bound port
    try:
        import webbrowser
        webbrowser.open(server_url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Dulhaniya server...")
        httpd.server_close()
        try:
            if os.path.exists(port_file):
                os.remove(port_file)
        except Exception:
            pass


if __name__ == "__main__":
    run()
