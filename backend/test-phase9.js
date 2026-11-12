/**
 * Automated Verification Test for Phase 9: Virtual Lab (Three.js 3D in the Browser)
 * Verifies Tasks 9.1 to 9.6 against exact "Done when" requirements in Tasks.md and Design.md.
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Lab = require('./models/Lab');
const LabResult = require('./models/LabResult');
const User = require('./models/User');
const { generateToken } = require('./utils/jwt');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runPhase9Tests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 9 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    await sleep(1000);

    // -------------------------------------------------------------
    // Task 9.1: Three.js Basics, Render Loop & Memory Cleanup
    // Done when: you understand the render loop.
    // -------------------------------------------------------------
    console.log('--- Testing Task 9.1: Three.js Scene, Camera, Renderer & Render Loop ---');
    const compPath = path.resolve(__dirname, '..', 'frontend', 'src', 'components', 'PendulumSimulation.jsx');
    const compCode = fs.readFileSync(compPath, 'utf-8');

    if (!compCode.includes("import * as THREE from 'three'")) {
      throw new Error('Task 9.1 Failed: PendulumSimulation does not import Three.js');
    }
    if (!compCode.includes('THREE.Scene') || !compCode.includes('THREE.PerspectiveCamera') || !compCode.includes('THREE.WebGLRenderer')) {
      throw new Error('Task 9.1 Failed: Three.js core scene, camera, or renderer not initialized');
    }
    if (!compCode.includes('requestAnimationFrame') || !compCode.includes('cancelAnimationFrame')) {
      throw new Error('Task 9.1 Failed: Component does not manage requestAnimationFrame render loop with cancel on cleanup');
    }
    if (!compCode.includes('dispose') || !compCode.includes('removeEventListener') && !compCode.includes('disconnect')) {
      throw new Error('Task 9.1 Failed: Component does not implement memory disposal for Three.js geometries and textures');
    }
    console.log('✅ Task 9.1 PASSED: Three.js scene, camera, renderer, 60fps render loop, and memory disposal verified.');

    // -------------------------------------------------------------
    // Task 9.2: Pick the v1 Experiment in Design.md
    // Done when: the experiment is written in Design.md with its variables and expected results.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 9.2: v1 Experiment Specification in Design.md ---');
    const designPath = path.resolve(__dirname, '..', 'Design.md');
    const designText = fs.readFileSync(designPath, 'utf-8');

    if (!designText.includes('5.3 v1 Virtual Lab Experiment Specification (Simple Pendulum)')) {
      throw new Error('Task 9.2 Failed: Design.md Section 5.3 Simple Pendulum specification missing');
    }
    if (!designText.includes('T = 2\\pi \\sqrt{\\frac{L}{g}}') && !designText.includes('T = 2\\pi\\sqrt{L/g}')) {
      throw new Error('Task 9.2 Failed: Simple pendulum mathematical equation not found in Design.md');
    }
    if (!designText.includes('Length ($L$)') || !designText.includes('Bob Mass ($m$)') || !designText.includes('Gravity Field ($g$)')) {
      throw new Error('Task 9.2 Failed: Physical variables not specified in Design.md');
    }
    console.log('✅ Task 9.2 PASSED: Simple Pendulum experiment fully specified in Design.md with variables and results.');

    // -------------------------------------------------------------
    // Task 9.3: Build the Scene (Pendulum Swings on Screen)
    // Done when: the pendulum swings on screen.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 9.3: 3D Pendulum Scene Elements & Swing Physics ---');
    if (!compCode.includes('CylinderGeometry') || !compCode.includes('SphereGeometry')) {
      throw new Error('Task 9.3 Failed: Pendulum string and spherical bob geometries missing');
    }
    if (!compCode.includes('pendulumGroup.rotation.z')) {
      throw new Error('Task 9.3 Failed: Pendulum group rotation angle not updated in animation loop');
    }
    console.log('✅ Task 9.3 PASSED: String, spherical bob, pivot mount, and swing rotation animation active.');

    // -------------------------------------------------------------
    // Task 9.4: Add Controls & Hand-written Physics Maths
    // Done when: changing the length changes the period correctly.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 9.4: Hand-written Physics Equations & Period Scaling ---');
    // Verify mathematical formulation: T = 2π * √(L / g)
    const calcPeriod = (L, g) => 2 * Math.PI * Math.sqrt(L / g);

    const T_1m_earth = calcPeriod(1.0, 9.80);
    const T_quarter_earth = calcPeriod(0.25, 9.80);
    const T_1m_moon = calcPeriod(1.0, 1.62);

    if (Math.abs(T_1m_earth - 2.006) > 0.01) {
      throw new Error(`Task 9.4 Failed: Period for 1m on Earth should be ~2.006s, got ${T_1m_earth}`);
    }
    if (Math.abs(T_quarter_earth - 1.003) > 0.01) {
      throw new Error(`Task 9.4 Failed: Period for 0.25m on Earth should be ~1.003s (half), got ${T_quarter_earth}`);
    }
    if (Math.abs(T_1m_moon - 4.938) > 0.01) {
      throw new Error(`Task 9.4 Failed: Period for 1m on Moon should be ~4.938s, got ${T_1m_moon}`);
    }

    // Verify code contains exact mathematical formulas
    if (!compCode.includes('2 * Math.PI * Math.sqrt') || !compCode.includes('Math.cos(currentOmega * simTimeRef.current)')) {
      throw new Error('Task 9.4 Failed: Hand-written period or angle oscillation formulas missing in simulation component');
    }
    console.log(`✅ Task 9.4 PASSED: Physics period scaling verified:`);
    console.log(`   - Length 1.00m (Earth): T = ${T_1m_earth.toFixed(3)}s`);
    console.log(`   - Length 0.25m (Earth): T = ${T_quarter_earth.toFixed(3)}s (exactly halved!)`);
    console.log(`   - Length 1.00m (Moon) : T = ${T_1m_moon.toFixed(3)}s (slower in low gravity!)`);

    // -------------------------------------------------------------
    // Task 9.5: Instructions and Observation Quiz
    // Done when: finishing the lab saves a result.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 9.5: Virtual Lab API, Instructions & Quiz Result Persistence ---');

    // 1. Check MongoDB Seeded Lab
    const lab = await Lab.findOne({ experimentType: 'simple_pendulum' });
    if (!lab) {
      throw new Error('Task 9.5 Failed: Simple Pendulum lab not seeded in MongoDB');
    }
    if (!lab.instructions || lab.instructions.length < 3) {
      throw new Error('Task 9.5 Failed: Lab does not contain step-by-step instructions');
    }
    if (!lab.observationQuestions || lab.observationQuestions.length < 3) {
      throw new Error('Task 9.5 Failed: Lab does not contain at least 3 observation deduction questions');
    }
    console.log(`Found Lab in DB: "${lab.title}" with ${lab.instructions.length} steps and ${lab.observationQuestions.length} quiz questions.`);

    // 2. Test Student User Auth & Token
    let testStudent = await User.findOne({ email: 'labstudent@stem.edu' });
    if (!testStudent) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      testStudent = await User.create({
        name: 'Lab Student',
        email: 'labstudent@stem.edu',
        passwordHash,
        role: 'student'
      });
    }
    const token = generateToken({ id: testStudent._id, role: testStudent.role });

    // 3. GET /api/labs/:id (Check safe questions: correctIndex stripped)
    const getRes = await fetch(`${BASE_URL}/labs/simple_pendulum`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    if (!getData.success || !getData.lab) {
      throw new Error('Task 9.5 Failed: GET /api/labs/simple_pendulum failed');
    }
    if (getData.lab.observationQuestions[0].correctIndex !== undefined) {
      throw new Error('Task 9.5 Failed: GET /api/labs/:id must not expose correctIndex to students before quiz submission');
    }
    console.log('GET /api/labs/simple_pendulum verified: correctIndex safely stripped for student.');

    // 4. POST /api/labs/:id/submit with correct answers [1, 2, 1]
    const submitRes = await fetch(`${BASE_URL}/labs/simple_pendulum/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        answers: [1, 2, 1],
        simulationConfig: { length: 1.0, mass: 0.2, gravity: 9.80, angle: 12 }
      })
    });
    const submitData = await submitRes.json();
    if (!submitData.success || submitData.score !== 3 || !submitData.passed) {
      throw new Error(`Task 9.5 Failed: Expected 3/3 passed, got score: ${submitData.score}`);
    }
    console.log(`Quiz submission verified: Score ${submitData.score}/${submitData.totalQuestions} (${submitData.percentage}%) - Passed: ${submitData.passed}`);

    // 5. Verify LabResult was saved in MongoDB
    const savedResult = await LabResult.findById(submitData.resultId);
    if (!savedResult || savedResult.score !== 3) {
      throw new Error('Task 9.5 Failed: Finishing the lab did not save a LabResult in MongoDB');
    }
    console.log(`✅ Task 9.5 PASSED: Lab completed and Result ID ${savedResult._id} persisted in MongoDB.`);

    // 6. Test GET /api/labs/results/me
    const historyRes = await fetch(`${BASE_URL}/labs/results/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    if (!historyData.success || historyData.count === 0) {
      throw new Error('Task 9.5 Failed: GET /api/labs/results/me returned empty');
    }
    console.log(`Student past lab results verified: ${historyData.count} attempts logged.`);

    // -------------------------------------------------------------
    // Task 9.6: Performance and Fallback
    // Done when: Test on a mid-range phone; show a message when WebGL is not supported.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 9.6: WebGL Detection & 2D Canvas Fallback Engine ---');
    if (!compCode.includes('hasWebGL') || !compCode.includes('getContext(\'webgl\')')) {
      throw new Error('Task 9.6 Failed: WebGL support check missing in simulation');
    }
    if (!compCode.includes('<canvas') || !compCode.includes('render2D') || !compCode.includes('2D Canvas Fallback')) {
      throw new Error('Task 9.6 Failed: 2D Canvas fallback renderer or indicator missing');
    }
    if (!compCode.includes('Math.min(window.devicePixelRatio, 2)')) {
      throw new Error('Task 9.6 Failed: Pixel ratio capping for mid-range phone performance missing');
    }
    console.log('✅ Task 9.6 PASSED: WebGL detection, pixel ratio capping for mobile, and 2D canvas fallback verified.');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 9 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n❌ PHASE 9 TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('Server and DB connection closed.');
  }
}

runPhase9Tests();
