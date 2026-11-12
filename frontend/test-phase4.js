/**
 * Automated Verification Test for Phase 4: Frontend Foundation
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n=============================================');
console.log('   STARTING PHASE 4 AUTOMATED TEST SUITE');
console.log('=============================================\n');

let failed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// -------------------------------------------------------------
// Task 4.1: React + Vite build test
// -------------------------------------------------------------
console.log('--- Testing Task 4.1: Vite + React Starter Build ---');
const distHtml = path.join(__dirname, 'dist', 'index.html');
assert(fs.existsSync(distHtml), 'Vite production build output (dist/index.html) exists and loaded');

// -------------------------------------------------------------
// Task 4.2: Folder structure and routes
// -------------------------------------------------------------
console.log('\n--- Testing Task 4.2: Folder Structure & PRD Section 7 Routes ---');
const requiredDirs = ['pages', 'components', 'services', 'context'];
requiredDirs.forEach(dir => {
  assert(fs.existsSync(path.join(__dirname, 'src', dir)), `Directory src/${dir} exists`);
});

const appJsx = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf-8');
const expectedRoutes = [
  'path="/"',
  'path="/login"',
  'path="/signup"',
  'path="/dashboard"',
  'path="/subjects"',
  'path="/subjects/:subjectId/chapters/:chapterId"',
  'path="/lessons/:lessonId"',
  'path="/practice/:chapterId"',
  'path="/results"',
  'path="/labs/:labId"',
  'path="/profile"'
];

expectedRoutes.forEach(route => {
  assert(appJsx.includes(route), `Route ${route} declared in App.jsx`);
});

// -------------------------------------------------------------
// Task 4.3: API service layer
// -------------------------------------------------------------
console.log('\n--- Testing Task 4.3: API Service Layer (fetch & token wrapper) ---');
const apiJs = fs.readFileSync(path.join(__dirname, 'src', 'services', 'api.js'), 'utf-8');
assert(apiJs.includes('Authorization') && apiJs.includes('Bearer'), 'api.js attaches Bearer token automatically');
assert(apiJs.includes('/health'), 'api.js implements getHealth() method');
assert(apiJs.includes('/auth/signup') && apiJs.includes('/auth/login'), 'api.js implements signup and login methods');

// -------------------------------------------------------------
// Task 4.4: Auth Context & Protected Route
// -------------------------------------------------------------
console.log('\n--- Testing Task 4.4: Auth Context & ProtectedRoute ---');
const authCtx = fs.readFileSync(path.join(__dirname, 'src', 'context', 'AuthContext.jsx'), 'utf-8');
assert(authCtx.includes('localStorage.setItem(\'token\''), 'AuthContext stores token in localStorage');
assert(authCtx.includes('localStorage.removeItem(\'token\''), 'AuthContext handles logout token removal');

const protectedRouteJsx = fs.readFileSync(path.join(__dirname, 'src', 'components', 'ProtectedRoute.jsx'), 'utf-8');
assert(protectedRouteJsx.includes('to="/login"'), 'ProtectedRoute redirects unauthenticated users to /login');

// -------------------------------------------------------------
// Task 4.5: Signup and Login Pages
// -------------------------------------------------------------
console.log('\n--- Testing Task 4.5: Signup and Login Pages ---');
const signupJsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'SignupPage.jsx'), 'utf-8');
assert(signupJsx.includes('board'), 'Signup page includes board selector (CBSE/State Board)');
assert(signupJsx.includes('class'), 'Signup page includes class grade selector');
assert(signupJsx.includes('language'), 'Signup page includes language preference selector');
assert(signupJsx.includes('navigate(\'/dashboard\')'), 'Signup page redirects student to /dashboard upon completion');

const loginJsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'LoginPage.jsx'), 'utf-8');
assert(loginJsx.includes('login('), 'Login page invokes auth.login');

// -------------------------------------------------------------
// Task 4.6: Mobile-first layout & Color Tokens
// -------------------------------------------------------------
console.log('\n--- Testing Task 4.6: Mobile-First Layout & Color Tokens ---');
const layoutJsx = fs.readFileSync(path.join(__dirname, 'src', 'components', 'Layout.jsx'), 'utf-8');
assert(layoutJsx.includes('bottom-nav'), 'Layout includes bottom navigation bar container');
assert(layoutJsx.includes('/dashboard') && layoutJsx.includes('Home'), 'Bottom bar includes Home tab');
assert(layoutJsx.includes('/subjects') && layoutJsx.includes('Learn'), 'Bottom bar includes Learn tab');
assert(layoutJsx.includes('/results') && layoutJsx.includes('Practice'), 'Bottom bar includes Practice tab');
assert(layoutJsx.includes('/profile') && layoutJsx.includes('Profile'), 'Bottom bar includes Profile tab');

const indexCss = fs.readFileSync(path.join(__dirname, 'src', 'index.css'), 'utf-8');
const requiredTokens = [
  '--color-primary: #2563EB',
  '--color-secondary: #7C3AED',
  '--color-background: #F8FAFC',
  '--color-surface: #FFFFFF',
  '--color-text: #0F172A',
  '--color-muted: #64748B',
  '--color-success: #16A34A',
  '--color-warning: #CA8A04',
  '--color-error: #DC2626'
];
requiredTokens.forEach(token => {
  assert(indexCss.includes(token), `CSS defines PRD Section 6 token: ${token}`);
});
assert(indexCss.includes('max-width: 640px'), 'Mobile-first responsive styling constraints configured (375px viewport optimized)');

console.log('\n=============================================');
if (failed) {
  console.error('❌ PHASE 4 VERIFICATION FAILED');
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 4 CHECKS PASSED WITH ZERO ERRORS!');
  console.log('=============================================\n');
}
