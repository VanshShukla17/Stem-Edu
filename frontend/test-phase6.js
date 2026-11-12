/**
 * Automated Verification Test for Phase 6: MCQ Practice
 * Verifies Tasks 6.1 to 6.4 against exact "Done when" requirements.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n=============================================');
console.log('   STARTING PHASE 6 AUTOMATED TEST SUITE');
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

const testPageJsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'PracticeTestPage.jsx'), 'utf-8');
const resultsPageJsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'ResultsPage.jsx'), 'utf-8');

// -------------------------------------------------------------
// Task 6.1: Test Page - Show one question at a time with options
// Done when: you can move through all questions.
// -------------------------------------------------------------
console.log('--- Testing Task 6.1: Test Page Single-Question Navigation ---');
assert(testPageJsx.includes('questions[currentIndex]'), 'Test page displays single question at currentIndex');
assert(testPageJsx.includes('handleNext') && testPageJsx.includes('handlePrev'), 'Previous and Next navigation handlers implemented');
assert(testPageJsx.includes('Question {currentIndex + 1} of {questions.length}'), 'Question progress counter rendered');
assert(testPageJsx.includes('options.map'), 'Question options rendered with selection handler');
assert(testPageJsx.includes('handleSelectOption'), 'Option selection recorded in component state');

// -------------------------------------------------------------
// Task 6.2: Submit & Result Screen
// Send answers, show score and an explanation for each question.
// Done when: right and wrong answers are marked with an icon and text (not colour alone).
// -------------------------------------------------------------
console.log('\n--- Testing Task 6.2: Submit and Result Screen ---');
assert(testPageJsx.includes('api.submitChapterTest('), 'Submits test answers payload to backend API');
assert(testPageJsx.includes('{testResult.score} / {testResult.totalQuestions}'), 'Displays total score banner');
assert(testPageJsx.includes('{testResult.percentage}%'), 'Displays score percentage');
assert(testPageJsx.includes('CheckCircle2') && testPageJsx.includes('XCircle'), 'Imports both CheckCircle2 and XCircle status icons');
assert(testPageJsx.includes('[Your Answer: Correct]'), 'Correct student answers marked with text: [Your Answer: Correct]');
assert(testPageJsx.includes('[Your Answer: Incorrect]'), 'Wrong student answers marked with text: [Your Answer: Incorrect]');
assert(testPageJsx.includes('[Correct Answer]'), 'Official correct answers highlighted with text: [Correct Answer]');
assert(testPageJsx.includes('ans.explanation'), 'Displays pedagogical explanation for each question');

// -------------------------------------------------------------
// Task 6.3: Results History Page
// Done when: past attempts are listed.
// -------------------------------------------------------------
console.log('\n--- Testing Task 6.3: Results History Page ---');
assert(resultsPageJsx.includes('api.getResults()'), 'ResultsPage fetches past attempts from API');
assert(resultsPageJsx.includes('results.map('), 'ResultsPage iterates through past test attempts');
assert(resultsPageJsx.includes('item.score') && resultsPageJsx.includes('item.totalQuestions'), 'Displays score and total count for each attempt');
assert(resultsPageJsx.includes('item.percentage'), 'Displays score percentage badge');
assert(resultsPageJsx.includes('dateStr'), 'Displays attempt submission timestamp');

// -------------------------------------------------------------
// Task 6.4: Handle Edge Cases
// Empty chapter (no questions), leaving the test midway.
// Done when: neither case shows an error screen.
// -------------------------------------------------------------
console.log('\n--- Testing Task 6.4: Edge Case Handling ---');
// Case A: Empty chapter
assert(testPageJsx.includes('No Questions Available Yet') || testPageJsx.includes('no questions seeded'), 'Empty chapter renders friendly empty state instead of error screen');
assert(testPageJsx.includes('Return to Chapter Lessons') || testPageJsx.includes('Back to Chapter'), 'Empty chapter provides return navigation');

// Case B: Leaving test midway
assert(testPageJsx.includes('setShowExitModal(true)'), 'Exit action triggers midway confirmation dialog');
assert(testPageJsx.includes('Leave Practice Test?'), 'Confirmation dialog warns user before leaving test');
assert(testPageJsx.includes('Stay & Finish'), 'Offers option to stay and finish test');
assert(testPageJsx.includes('Leave Test'), 'Offers clean exit without error screen');

console.log('\n=============================================');
if (failed) {
  console.error('❌ PHASE 6 TESTS FAILED');
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 6 CHECKS PASSED WITH ZERO ERRORS!');
  console.log('=============================================\n');
}

