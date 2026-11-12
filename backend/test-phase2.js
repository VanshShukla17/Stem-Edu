/**
 * Test script for Phase 2: Authentication
 * Verifies all 5 tasks and their "Done when" conditions.
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 2 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    // Wait briefly for server & db connection to establish
    await sleep(1000);

    // Clean up test users from previous runs
    await User.deleteMany({
      email: { $in: ['student_test@example.com', 'admin_test@example.com', 'model_direct@example.com'] }
    });

    // -------------------------------------------------------------
    // Task 2.1: User model verification
    // -------------------------------------------------------------
    console.log('--- Testing Task 2.1: User Model ---');
    const directUser = await User.create({
      name: 'Direct DB Student',
      email: 'model_direct@example.com',
      passwordHash: await User.hashPassword('secret123'),
      role: 'student',
      classLevel: 10,
      board: 'CBSE',
      language: 'hi'
    });
    console.log('✅ Task 2.1 PASSED: Created user from test script:', directUser.email, 'with ID:', directUser._id);

    // -------------------------------------------------------------
    // Task 2.2: Signup route & duplicate email detection
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 2.2: Signup Route ---');
    const signupData = {
      name: 'Rohan Sharma',
      email: 'student_test@example.com',
      password: 'password123',
      class: 10,
      board: 'CBSE',
      language: 'en'
    };

    // First signup
    const signupRes1 = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    const signupJson1 = await signupRes1.json();
    console.log('Signup 1 status:', signupRes1.status);
    if (signupRes1.status !== 201 || !signupJson1.token) {
      throw new Error(`First signup failed: ${JSON.stringify(signupJson1)}`);
    }
    console.log('✅ First signup succeeded with JWT token.');

    // Duplicate signup with same email
    const signupRes2 = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    const signupJson2 = await signupRes2.json();
    console.log('Signup 2 status:', signupRes2.status, 'Response:', signupJson2);
    if (signupRes2.status !== 400 || !signupJson2.message.includes('already exists')) {
      throw new Error(`Duplicate email was not rejected properly: ${JSON.stringify(signupJson2)}`);
    }
    console.log('✅ Task 2.2 PASSED: Signing up twice with the same email returned a clear error (400).');

    // Create an admin user for admin middleware test
    const adminSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin_test@example.com',
        password: 'adminPassword123',
        role: 'admin'
      })
    });
    const adminSignupJson = await adminSignupRes.json();
    const adminToken = adminSignupJson.token;

    // -------------------------------------------------------------
    // Task 2.3: Login route and JWT verification
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 2.3: Login Route ---');
    // Wrong password test
    const wrongLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'student_test@example.com',
        password: 'WRONG_PASSWORD_XYZ'
      })
    });
    console.log('Wrong password status code:', wrongLoginRes.status);
    if (wrongLoginRes.status !== 401) {
      throw new Error(`Wrong password did not return 401: status ${wrongLoginRes.status}`);
    }
    console.log('✅ Wrong password correctly returned 401.');

    // Right password test
    const rightLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'student_test@example.com',
        password: 'password123'
      })
    });
    const rightLoginJson = await rightLoginRes.json();
    console.log('Right password status code:', rightLoginRes.status);
    if (rightLoginRes.status !== 200 || !rightLoginJson.token) {
      throw new Error(`Right password failed to return token: ${JSON.stringify(rightLoginJson)}`);
    }
    const studentToken = rightLoginJson.token;
    console.log('✅ Task 2.3 PASSED: Right password returned token, wrong password returned 401.');

    // -------------------------------------------------------------
    // Task 2.4: Auth middleware (requireAuth and requireAdmin)
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 2.4: Auth Middleware ---');
    // Missing token
    const noTokenRes = await fetch(`${BASE_URL}/test/protected`);
    console.log('Missing token status code:', noTokenRes.status);
    if (noTokenRes.status !== 401) {
      throw new Error(`Missing token did not return 401: status ${noTokenRes.status}`);
    }

    // Invalid token
    const invalidTokenRes = await fetch(`${BASE_URL}/test/protected`, {
      headers: { Authorization: 'Bearer invalid.bogus.jwt.token' }
    });
    console.log('Invalid token status code:', invalidTokenRes.status);
    if (invalidTokenRes.status !== 401) {
      throw new Error(`Invalid token did not return 401: status ${invalidTokenRes.status}`);
    }

    // Valid student token on protected route
    const validStudentRes = await fetch(`${BASE_URL}/test/protected`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('Valid student token status code:', validStudentRes.status);
    if (validStudentRes.status !== 200) {
      throw new Error(`Valid student token failed on protected route: status ${validStudentRes.status}`);
    }

    // Non-admin token on admin route
    const nonAdminRes = await fetch(`${BASE_URL}/test/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('Student on admin route status code:', nonAdminRes.status);
    if (nonAdminRes.status !== 403) {
      throw new Error(`Non-admin student on admin route did not return 403: status ${nonAdminRes.status}`);
    }

    // Admin token on admin route
    const adminRes = await fetch(`${BASE_URL}/test/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Admin on admin route status code:', adminRes.status);
    if (adminRes.status !== 200) {
      throw new Error(`Admin on admin route did not return 200: status ${adminRes.status}`);
    }
    console.log('✅ Task 2.4 PASSED: Middleware rejected missing (401), invalid (401), and non-admin (403) tokens.');

    // -------------------------------------------------------------
    // Task 2.5: Profile routes (GET /api/me and PUT /api/me)
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 2.5: Profile Routes ---');
    // GET /api/me before update
    const meBeforeRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meBeforeJson = await meBeforeRes.json();
    console.log('Current class before update:', meBeforeJson.user.classLevel);

    // PUT /api/me: change class to 11 and language to 'hi'
    const updateRes = await fetch(`${BASE_URL}/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        class: 11,
        board: 'CBSE',
        language: 'hi'
      })
    });
    const updateJson = await updateRes.json();
    console.log('Update profile response:', updateJson.message, 'New class:', updateJson.user.classLevel);

    // GET /api/me after update to verify persistence
    const meAfterRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meAfterJson = await meAfterRes.json();
    console.log('Class returned by GET /api/me after update:', meAfterJson.user.classLevel);

    if (meAfterJson.user.classLevel !== 11) {
      throw new Error(`Expected classLevel to be 11, but got ${meAfterJson.user.classLevel}`);
    }
    if (meAfterJson.user.language !== 'hi') {
      throw new Error(`Expected language to be 'hi', but got ${meAfterJson.user.language}`);
    }
    console.log('✅ Task 2.5 PASSED: Updating class changed what GET /api/me returns (10 -> 11).');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 2 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    // Close DB connection and HTTP server
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server and DB connection closed.');
      process.exit(process.exitCode || 0);
    });
  }
}

runTests();
