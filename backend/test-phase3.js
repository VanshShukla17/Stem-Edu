/**
 * Automated Test Suite for Phase 3: Content models and APIs
 * Verifies all 6 tasks (3.1 to 3.6) and their exact "Done when" requirements.
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const Lesson = require('./models/Lesson');
const Question = require('./models/Question');
const TestResult = require('./models/TestResult');
const Progress = require('./models/Progress');
const { generateToken } = require('./utils/jwt');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPhase3Tests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 3 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    await sleep(1000);

    // 1. Setup Test Student
    await User.deleteMany({ email: 'phase3_student@example.com' });
    const student = await User.create({
      name: 'Priya Patel',
      email: 'phase3_student@example.com',
      passwordHash: await User.hashPassword('pass12345'),
      role: 'student',
      classLevel: 10,
      board: 'CBSE',
      language: 'en'
    });
    const token = generateToken({ id: student._id, role: student.role });
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // Clean up test content
    await Subject.deleteMany({ code: 'phy_test_phase3' });
    const testSubject = await Subject.create({
      name: 'Physics',
      nameHindi: 'भौतिक विज्ञान',
      code: 'phy_test_phase3',
      classLevel: 10,
      board: 'CBSE'
    });

    // -------------------------------------------------------------
    // Task 3.1: Subject and Chapter models + routes
    // Done when: a test chapter shows up only for the matching profile.
    // -------------------------------------------------------------
    console.log('--- Testing Task 3.1: Subject & Chapter Models + Filtering ---');

    await Chapter.deleteMany({ subjectId: testSubject._id });
    // Chapter 1: Matching profile (CBSE, Class 10)
    const matchingChapter = await Chapter.create({
      subjectId: testSubject._id,
      chapterNumber: 12,
      title: 'Electricity',
      titleHindi: 'विद्युत',
      board: 'CBSE',
      classLevel: 10
    });

    // Chapter 2: Non-matching profile (ICSE, Class 11)
    const nonMatchingChapter = await Chapter.create({
      subjectId: testSubject._id,
      chapterNumber: 99,
      title: 'Advanced Thermodynamics',
      titleHindi: 'उष्मागतिकी',
      board: 'ICSE',
      classLevel: 11
    });

    const chaptersRes = await fetch(`${BASE_URL}/subjects/${testSubject._id}/chapters`, {
      headers: authHeaders
    });
    const chapters = await chaptersRes.json();
    console.log('Fetched chapters count for CBSE Class 10 student:', chapters.length);
    console.log('Chapters returned:', chapters.map(c => `${c.title} (${c.board} Class ${c.classLevel})`));

    const foundMatching = chapters.some(c => c.id === matchingChapter._id.toString());
    const foundNonMatching = chapters.some(c => c.id === nonMatchingChapter._id.toString());

    if (!foundMatching || foundNonMatching) {
      throw new Error(`Task 3.1 Failed: Expected only matching chapter, but got: ${JSON.stringify(chapters)}`);
    }
    console.log('✅ Task 3.1 PASSED: Test chapter shows up ONLY for the matching profile (CBSE Class 10).');

    // -------------------------------------------------------------
    // Task 3.2: Lesson model + routes
    // Done when: a lesson returns its title and content blocks (text, image).
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 3.2: Lesson Model + Content Blocks ---');

    await Lesson.deleteMany({ chapterId: matchingChapter._id });
    const lessonWithBlocks = await Lesson.create({
      chapterId: matchingChapter._id,
      lessonNumber: 1,
      title: 'Electric Current and Simple Circuits',
      titleHindi: 'विद्युत धारा और सरल परिपथ',
      contentBlocks: [
        {
          type: 'text',
          content: 'Electric current is the rate of flow of electric charge through a conductor.',
          contentHindi: 'विद्युत आवेश के प्रवाह की दर को विद्युत धारा कहते हैं।'
        },
        {
          type: 'image',
          content: 'A schematic diagram of a closed electric circuit.',
          mediaUrl: 'https://example.com/circuit-diagram.png'
        }
      ]
    });

    const lessonRes = await fetch(`${BASE_URL}/lessons/${lessonWithBlocks._id}`, {
      headers: authHeaders
    });
    const lessonJson = await lessonRes.json();
    console.log('Lesson Title:', lessonJson.title);
    console.log('Content Blocks count:', lessonJson.contentBlocks.length);
    console.log('Content block types:', lessonJson.contentBlocks.map(b => b.type));

    const hasText = lessonJson.contentBlocks.some(b => b.type === 'text' && b.content.length > 0);
    const hasImage = lessonJson.contentBlocks.some(b => b.type === 'image' && b.mediaUrl);

    if (!lessonJson.title || !hasText || !hasImage) {
      throw new Error(`Task 3.2 Failed: Lesson did not return expected title and content blocks (text, image)`);
    }
    console.log('✅ Task 3.2 PASSED: Lesson returned its title and content blocks (text, image).');

    // -------------------------------------------------------------
    // Task 3.3: Progress tracking
    // Done when: completing 2 of 4 lessons shows 50%.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 3.3: Progress Tracking ---');

    // Add 3 more lessons so we have exactly 4 lessons in matchingChapter
    const lesson2 = await Lesson.create({
      chapterId: matchingChapter._id,
      lessonNumber: 2,
      title: 'Electric Potential and Potential Difference',
      titleHindi: 'विद्युत विभव'
    });
    const lesson3 = await Lesson.create({
      chapterId: matchingChapter._id,
      lessonNumber: 3,
      title: "Ohm's Law and Resistance",
      titleHindi: 'ओम का नियम'
    });
    const lesson4 = await Lesson.create({
      chapterId: matchingChapter._id,
      lessonNumber: 4,
      title: 'Heating Effect of Current',
      titleHindi: 'तापीय प्रभाव'
    });

    // Reset progress
    await Progress.deleteMany({ userId: student._id, chapterId: matchingChapter._id });

    // Complete lesson 1
    const compRes1 = await fetch(`${BASE_URL}/lessons/${lessonWithBlocks._id}/complete`, {
      method: 'POST',
      headers: authHeaders
    });
    const compJson1 = await compRes1.json();
    console.log(`After completing lesson 1 of 4: ${compJson1.completedLessonsCount}/4 -> ${compJson1.completionPercentage}%`);

    // Complete lesson 2
    const compRes2 = await fetch(`${BASE_URL}/lessons/${lesson2._id}/complete`, {
      method: 'POST',
      headers: authHeaders
    });
    const compJson2 = await compRes2.json();
    console.log(`After completing lesson 2 of 4: ${compJson2.completedLessonsCount}/4 -> ${compJson2.completionPercentage}%`);

    if (compJson2.completedLessonsCount !== 2 || compJson2.completionPercentage !== 50) {
      throw new Error(`Task 3.3 Failed: Expected 50% for 2 of 4 lessons, got ${compJson2.completionPercentage}%`);
    }
    console.log('✅ Task 3.3 PASSED: Completing 2 of 4 lessons shows 50%.');

    // -------------------------------------------------------------
    // Task 3.4: Question model + test routes
    // Done when: the response has no correctIndex field.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 3.4: Question Model & Safe Test Route ---');

    await Question.deleteMany({ chapterId: matchingChapter._id });
    const q1 = await Question.create({
      chapterId: matchingChapter._id,
      questionText: 'What is the SI unit of electric current?',
      options: ['Volt', 'Ampere', 'Ohm', 'Joule'],
      correctOptionIndex: 1, // Ampere
      explanation: 'Ampere (A) is the SI unit of electric current.'
    });

    const q2 = await Question.create({
      chapterId: matchingChapter._id,
      questionText: 'Which law states V = IR?',
      options: ["Newton's Law", "Faraday's Law", "Ohm's Law", "Coulomb's Law"],
      correctOptionIndex: 2, // Ohm's Law
      explanation: "Ohm's Law states that V is proportional to I, so V = IR."
    });

    const q3 = await Question.create({
      chapterId: matchingChapter._id,
      questionText: 'Electrical resistance depends on:',
      options: ['Length only', 'Area only', 'Length and Area and Material', 'None of these'],
      correctOptionIndex: 2, // Length and Area and Material
      explanation: 'Resistance R = rho * L / A.'
    });

    const testQuestionsRes = await fetch(`${BASE_URL}/chapters/${matchingChapter._id}/test`, {
      headers: authHeaders
    });
    const testQuestions = await testQuestionsRes.json();
    console.log('Fetched test questions count:', testQuestions.length);

    let hasCorrectIndex = false;
    let hasCorrectOptionIndex = false;
    let hasExplanation = false;

    testQuestions.forEach((q, idx) => {
      if ('correctIndex' in q) hasCorrectIndex = true;
      if ('correctOptionIndex' in q) hasCorrectOptionIndex = true;
      if ('explanation' in q) hasExplanation = true;
    });

    console.log('Contains correctIndex:', hasCorrectIndex);
    console.log('Contains correctOptionIndex:', hasCorrectOptionIndex);
    console.log('Contains explanation:', hasExplanation);

    if (hasCorrectIndex || hasCorrectOptionIndex || hasExplanation) {
      throw new Error('Task 3.4 Failed: Test response contains sensitive answer or explanation fields!');
    }
    console.log('✅ Task 3.4 PASSED: GET /api/chapters/:id/test returns questions WITHOUT correctIndex or explanations.');

    // -------------------------------------------------------------
    // Task 3.5: Scoring route (hand-write)
    // Done when: a known set of answers gives the expected score.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 3.5: Hand-written Server-Side Scoring ---');

    // Known answers:
    // q1 correct answer: 1 -> send 1 (CORRECT)
    // q2 correct answer: 2 -> send 2 (CORRECT)
    // q3 correct answer: 2 -> send 0 (INCORRECT)
    // Expected score: 2 out of 3 (67%)
    const submissionBody = {
      answers: [
        { questionId: q1._id, selectedOptionIndex: 1 },
        { questionId: q2._id, selectedOptionIndex: 2 },
        { questionId: q3._id, selectedOptionIndex: 0 }
      ],
      timeTakenSeconds: 95
    };

    const submitRes = await fetch(`${BASE_URL}/chapters/${matchingChapter._id}/test/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(submissionBody)
    });
    const submitJson = await submitRes.json();
    console.log(`Scored: ${submitJson.score} / ${submitJson.totalQuestions} (${submitJson.percentage}%)`);
    console.log('Answers received in response:', submitJson.answers.length);

    if (submitJson.score !== 2 || submitJson.totalQuestions !== 3 || submitJson.percentage !== 67) {
      throw new Error(`Task 3.5 Failed: Expected score 2/3 (67%), got ${submitJson.score}/${submitJson.totalQuestions} (${submitJson.percentage}%)`);
    }
    if (!submitJson.answers[0].explanation || !submitJson.answers[0].isCorrect) {
      throw new Error('Task 3.5 Failed: Itemized answers missing explanation or correctness tag');
    }
    console.log('✅ Task 3.5 PASSED: Known set of answers gave the exact expected score (2/3, 67%) plus explanations.');

    // -------------------------------------------------------------
    // Task 3.6: Result history
    // Done when: two attempts both appear, newest first.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 3.6: Result History ---');

    // Submit a second attempt with 3/3 (100%)
    await sleep(200);
    const submissionBody2 = {
      answers: [
        { questionId: q1._id, selectedOptionIndex: 1 },
        { questionId: q2._id, selectedOptionIndex: 2 },
        { questionId: q3._id, selectedOptionIndex: 2 }
      ],
      timeTakenSeconds: 45
    };

    const submitRes2 = await fetch(`${BASE_URL}/chapters/${matchingChapter._id}/test/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(submissionBody2)
    });
    const submitJson2 = await submitRes2.json();
    console.log(`Attempt 2 Scored: ${submitJson2.score} / ${submitJson2.totalQuestions} (${submitJson2.percentage}%)`);

    // Fetch result history
    const resultsRes = await fetch(`${BASE_URL}/results`, {
      headers: authHeaders
    });
    const results = await resultsRes.json();
    console.log('Total results retrieved:', results.length);
    console.log('Scores in order:', results.map(r => `${r.score}/${r.totalQuestions} at ${r.createdAt}`));

    if (results.length < 2) {
      throw new Error(`Task 3.6 Failed: Expected at least 2 attempts, found ${results.length}`);
    }

    const firstTime = new Date(results[0].createdAt).getTime();
    const secondTime = new Date(results[1].createdAt).getTime();

    if (firstTime < secondTime) {
      throw new Error(`Task 3.6 Failed: Results are not sorted newest first (${firstTime} < ${secondTime})`);
    }

    if (results[0].score !== 3 || results[1].score !== 2) {
      throw new Error(`Task 3.6 Failed: Newest attempt (score 3) should appear before earlier attempt (score 2)`);
    }

    console.log('✅ Task 3.6 PASSED: Two attempts both appear, newest first.');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 3 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('\n❌ PHASE 3 TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server and DB connection closed.');
      process.exit(process.exitCode || 0);
    });
  }
}

runPhase3Tests();

