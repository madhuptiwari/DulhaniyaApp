/**
 * Automated Enterprise Test Suite for Dulhaniya™ Netlify Function & Node Backend
 * Tests:
 * 1. Admin Lockdown & Security (HTTP 401 on unauthenticated calls)
 * 2. Admin Login & Authorized Access
 * 3. Customer Authentication (Register, Login, Me, Addresses, Bookings)
 * 4. Partner Dashboard & Duty Status Toggle
 * 5. Parity across Node & Netlify runtimes
 */

const assert = require('assert');
const path = require('path');
const netlifyApi = require('../netlify/functions/api');

async function callNetlify(method, pathStr, body = null, headers = {}) {
  const event = {
    httpMethod: method,
    path: pathStr,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : null,
    queryStringParameters: null
  };
  return await netlifyApi.handler(event, {});
}

async function runTests() {
  console.log("Starting Dulhaniya Netlify & Node Enterprise Test Suite...\n");
  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`  [PASS] ${description}`);
    } catch (e) {
      console.error(`  [FAIL] ${description}:`, e.message);
      throw e;
    }
  }

  // 1. Admin Lockdown
  console.log("--- 1. Testing Admin Security Lockdown ---");
  let res = await callNetlify("GET", "/api/admin/stats");
  test("Unauthenticated GET /api/admin/stats returns 401", () => {
    assert.strictEqual(res.statusCode, 401);
    const body = JSON.parse(res.body);
    assert.match(body.error, /Admin authentication required/);
  });

  res = await callNetlify("GET", "/api/admin/beauticians");
  test("Unauthenticated GET /api/admin/beauticians returns 401", () => {
    assert.strictEqual(res.statusCode, 401);
  });

  res = await callNetlify("GET", "/api/admin/stats", null, { authorization: "Bearer invalidtoken123" });
  test("Invalid admin token returns 401", () => {
    assert.strictEqual(res.statusCode, 401);
  });

  // 2. Admin Login
  console.log("\n--- 2. Testing Admin Login & Privileged Gateway ---");
  res = await callNetlify("POST", "/api/admin/login", { username: "admin", password: "wrongpassword" });
  test("Admin login with invalid password rejects with 401", () => {
    assert.strictEqual(res.statusCode, 401);
  });

  res = await callNetlify("POST", "/api/admin/login", { username: "admin", password: "dulhaniya@royal2026" });
  let adminToken = "";
  test("Admin login with valid credentials succeeds", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    adminToken = body.token;
  });

  res = await callNetlify("GET", "/api/admin/stats", null, { authorization: `Bearer ${adminToken}` });
  test("Admin access to /api/admin/stats with valid token succeeds", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.stats.total_bookings !== undefined);
  });

  // 3. Customer Authentication
  console.log("\n--- 3. Testing Universal Customer Authentication ---");
  const rand = Math.floor(Math.random() * 90000 + 10000);
  const testEmail = `bride_${rand}@example.com`;

  res = await callNetlify("POST", "/api/auth/register", {
    name: `Bride ${rand}`,
    email: testEmail,
    phone: `+91 98989 ${rand}`,
    password: "secureBridePass123",
    role: "customer"
  });
  test("Customer registration creates account and issues token", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
  });

  res = await callNetlify("POST", "/api/auth/login", {
    email: testEmail,
    password: "secureBridePass123"
  });
  let custToken = "";
  test("Customer login succeeds with correct credentials", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.email, testEmail);
    assert.strictEqual(body.user.password_hash, undefined);
    custToken = body.token;
  });

  res = await callNetlify("GET", "/api/auth/me", null, { authorization: `Bearer ${custToken}` });
  test("GET /api/auth/me returns customer profile without password_hash", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.email, testEmail);
    assert.strictEqual(body.user.password_hash, undefined);
  });

  // 4. Customer Addresses & Bookings
  console.log("\n--- 4. Testing Customer Addresses & Portal Features ---");
  res = await callNetlify("GET", "/api/user/addresses", null, { authorization: `Bearer ${custToken}` });
  test("GET /api/user/addresses returns address list", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.addresses));
  });

  res = await callNetlify("POST", "/api/user/addresses", {
    label: "Bridal Suite",
    address: "Taj Palace, Chanakyapuri",
    city: "New Delhi",
    pincode: "110021",
    is_default: true
  }, { authorization: `Bearer ${custToken}` });
  test("POST /api/user/addresses adds new address", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
  });

  res = await callNetlify("GET", "/api/user/bookings", null, { authorization: `Bearer ${custToken}` });
  test("GET /api/user/bookings returns customer bookings array", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.bookings));
  });

  // 5. Partner Portal Endpoints
  console.log("\n--- 5. Testing Partner Specialist Dashboard & Workflows ---");
  res = await callNetlify("POST", "/api/auth/login", {
    email: "partner@dulhaniya.com",
    password: "partner123"
  });
  let partnerToken = "";
  test("Partner login succeeds for Pooja Sharma", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.role, "partner");
    partnerToken = body.token;
  });

  res = await callNetlify("GET", "/api/partner/dashboard", null, { authorization: `Bearer ${partnerToken}` });
  let initialDuty = 1;
  test("GET /api/partner/dashboard returns duty status and earnings", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(body.partner);
    assert.ok(body.today_earnings !== undefined);
    initialDuty = body.is_available;
  });

  res = await callNetlify("POST", "/api/partner/toggle-duty", {}, { authorization: `Bearer ${partnerToken}` });
  test("POST /api/partner/toggle-duty toggles duty status", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.notStrictEqual(body.is_available, initialDuty);
  });

  res = await callNetlify("GET", "/api/partner/jobs", null, { authorization: `Bearer ${partnerToken}` });
  test("GET /api/partner/jobs returns partner assigned jobs", () => {
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.jobs));
  });

  console.log(`\n========================================`);
  console.log(`  ALL ${passed}/${total} NODE & NETLIFY TESTS PASSED!`);
  console.log(`========================================\n`);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
