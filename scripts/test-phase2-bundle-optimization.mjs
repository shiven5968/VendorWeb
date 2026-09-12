import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

console.log('======================================================================');
console.log('  MESSMATES — PHASE 2.5 BUNDLE OPTIMIZATION & CODE SPLITTING AUDIT');
console.log('======================================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         Error: ${err.message}`);
      failed++;
    }
  }

  // --- Test 1: dist and assets directory exist ---
  test('1. Production build output directory exists', () => {
    assert.ok(fs.existsSync(DIST_DIR), 'dist directory must exist');
    assert.ok(fs.existsSync(ASSETS_DIR), 'dist/assets directory must exist');
    const files = fs.readdirSync(ASSETS_DIR);
    assert.ok(files.length > 10, `Expected multiple chunk assets, found ${files.length}`);
  });

  const assetFiles = fs.existsSync(ASSETS_DIR) ? fs.readdirSync(ASSETS_DIR) : [];

  // --- Test 2: Heavy vendor chunks are cleanly isolated ---
  test('2. Heavy vendor chunks are properly isolated', () => {
    const hasCharts = assetFiles.some(f => f.startsWith('vendor-charts') && f.endsWith('.js'));
    const hasPdf = assetFiles.some(f => f.startsWith('vendor-pdf') && f.endsWith('.js'));
    const hasFirebase = assetFiles.some(f => f.startsWith('vendor-firebase') && f.endsWith('.js'));
    const hasIcons = assetFiles.some(f => f.startsWith('vendor-icons') && f.endsWith('.js'));

    assert.ok(hasCharts, 'vendor-charts chunk must exist for recharts/d3');
    assert.ok(hasPdf, 'vendor-pdf chunk must exist for jspdf/html2canvas');
    assert.ok(hasFirebase, 'vendor-firebase chunk must exist for firebase SDK');
    assert.ok(hasIcons, 'vendor-icons chunk must exist for lucide-react');
  });

  // --- Test 3: Core App Entry bundle size reduction ---
  test('3. Main entry bundle is drastically reduced from baseline ~2.19 MB', () => {
    const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
    const mainEntry = jsFiles.find(f => f.startsWith('index-') && !f.includes('.es-'));
    assert.ok(mainEntry, 'Main entry JS bundle must exist');

    const entryPath = path.join(ASSETS_DIR, mainEntry);
    const stat = fs.statSync(entryPath);
    const sizeKb = stat.size / 1024;

    console.log(`         Main entry bundle size: ${sizeKb.toFixed(2)} kB (baseline was ~2,199.18 kB)`);
    assert.ok(sizeKb < 600, `Main entry size (${sizeKb.toFixed(2)} kB) must be < 600 kB`);
  });

  // --- Test 4: Route pages code-split into distinct chunks ---
  test('4. Route pages are split into distinct on-demand chunks', () => {
    const expectedPageChunks = [
      'MenuPage',
      'VotingPage',
      'HealthyRewardsPage',
      'StudentDashboard',
      'WardenDashboard',
      'MessCommitteeDashboard',
      'AnalyticsPage',
      'ReportsPage',
      'DailyPhotosPage',
      'HygieneCheckPage',
      'PhotoArchivePage',
      'LandingPage',
      'LoginPage',
      'MusclePassPage',
      'ActivityPage',
      'ProfilePage'
    ];

    for (const page of expectedPageChunks) {
      const match = assetFiles.some(f => f.startsWith(`${page}-`) && f.endsWith('.js'));
      assert.ok(match, `Route page chunk for "${page}" must exist in build output`);
    }
  });

  // --- Test 5: Modals are code-split into distinct on-demand chunks ---
  test('5. Modals are code-split into distinct on-demand chunks', () => {
    const expectedModalChunks = [
      'NotificationDrawer',
      'SearchModal',
      'MealDetailModal',
      'RewardClaimModal',
      'AddEditMealModal'
    ];

    for (const modal of expectedModalChunks) {
      const match = assetFiles.some(f => f.startsWith(`${modal}-`) && f.endsWith('.js'));
      assert.ok(match, `Modal chunk for "${modal}" must exist in build output`);
    }
  });

  // --- Test 6: App.jsx code patterns (React.lazy, Suspense, fallback) ---
  test('6. App.jsx uses React.lazy and Suspense for page loading', () => {
    const appPath = path.join(REPO_ROOT, 'src', 'App.jsx');
    const content = fs.readFileSync(appPath, 'utf8');

    assert.ok(content.includes('Suspense'), 'App.jsx must import and use Suspense');
    assert.ok(content.includes('lazy('), 'App.jsx must use lazy() for route pages');
    assert.ok(content.includes('PageLoadingFallback'), 'App.jsx must define PageLoadingFallback');
    assert.ok(content.includes('fallback={<PageLoadingFallback />}'), 'App.jsx must provide PageLoadingFallback to Suspense');
    assert.ok(!content.includes("import { StudentDashboard } from './pages/StudentDashboard'"), 'App.jsx must not statically import StudentDashboard');
    assert.ok(!content.includes("import { MenuPage } from './pages/MenuPage'"), 'App.jsx must not statically import MenuPage');
    assert.ok(!content.includes("import { VotingPage } from './pages/VotingPage'"), 'App.jsx must not statically import VotingPage');
    assert.ok(!content.includes("import { HealthyRewardsPage } from './pages/HealthyRewardsPage'"), 'App.jsx must not statically import HealthyRewardsPage');
  });

  // --- Test 7: StudentSatisfactionModule uses dynamic import for PDF ---
  test('7. StudentSatisfactionModule dynamically imports PDF generator on demand', () => {
    const satisfactionPath = path.join(REPO_ROOT, 'src', 'components', 'satisfaction', 'StudentSatisfactionModule.jsx');
    const content = fs.readFileSync(satisfactionPath, 'utf8');

    assert.ok(
      content.includes("import('../../utils/satisfactionReportPdf')"),
      'StudentSatisfactionModule must use dynamic import for satisfactionReportPdf'
    );
    assert.ok(
      !content.includes("import { generateSatisfactionPdf } from '../../utils/satisfactionReportPdf'"),
      'StudentSatisfactionModule must not statically import satisfactionReportPdf'
    );
  });

  // --- Test 8: PhotoArchivePage uses dynamic import for messOperations ---
  test('8. PhotoArchivePage dynamically imports messOperations', () => {
    const archivePath = path.join(REPO_ROOT, 'src', 'pages', 'PhotoArchivePage.jsx');
    const content = fs.readFileSync(archivePath, 'utf8');

    assert.ok(
      content.includes("import('../services/messOperations')"),
      'PhotoArchivePage must use dynamic import for messOperations'
    );
    assert.ok(
      !content.includes("import { getMessPhotos } from '../services/messOperations'"),
      'PhotoArchivePage must not statically import getMessPhotos'
    );
  });

  // --- Test 9: vite.config.js manualChunks configuration ---
  test('9. vite.config.js properly configures manualChunks and chunkSizeWarningLimit', () => {
    const configPath = path.join(REPO_ROOT, 'vite.config.js');
    const content = fs.readFileSync(configPath, 'utf8');

    assert.ok(content.includes('manualChunks'), 'vite.config.js must define manualChunks');
    assert.ok(content.includes('vendor-pdf'), 'manualChunks must specify vendor-pdf');
    assert.ok(content.includes('vendor-charts'), 'manualChunks must specify vendor-charts');
    assert.ok(content.includes('vendor-firebase'), 'manualChunks must specify vendor-firebase');
    assert.ok(content.includes('vendor-icons'), 'manualChunks must specify vendor-icons');
    assert.ok(content.includes('chunkSizeWarningLimit'), 'vite.config.js must specify chunkSizeWarningLimit');
  });

  // Summary
  console.log('\n----------------------------------------------------------------------');
  console.log(`  Phase 2.5 Verification: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('----------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
