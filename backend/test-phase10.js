/**
 * Automated Verification Test for Phase 10: Admin (Hand-write)
 * Verifies Tasks 10.1, 10.2, and 10.3 against exact "Done when" requirements in Tasks.md.
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const Lesson = require('./models/Lesson');
const Progress = require('./models/Progress');
const { generateToken } = require('./utils/jwt');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runPhase10Tests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 10 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    await sleep(1000);

    // -------------------------------------------------------------
    // Set up Test Users: 1 Regular Student & 1 Admin
    // -------------------------------------------------------------
    const passwordHash = await bcrypt.hash('Password123!', 10);

    let student = await User.findOne({ email: 'student_phase10@stem.edu' });
    if (!student) {
      student = await User.create({
        name: 'Regular Student',
        email: 'student_phase10@stem.edu',
        passwordHash,
        role: 'student'
      });
    }

    let admin = await User.findOne({ email: 'admin_phase10@stem.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'Head Admin',
        email: 'admin_phase10@stem.edu',
        passwordHash,
        role: 'admin'
      });
    }

    const studentToken = generateToken({ id: student._id, role: student.role });
    const adminToken = generateToken({ id: admin._id, role: admin.role });

    const physics = await Subject.findOne({ code: 'physics' });
    if (!physics) {
      throw new Error('Physics subject not found in database');
    }

    // -------------------------------------------------------------
    // Task 10.1: Admin Routes in the Backend (requireAdmin)
    // Done when: a non-admin gets 403.
    // -------------------------------------------------------------
    console.log('--- Testing Task 10.1: Role-Gated Admin Routes & 403 Forbidden ---');

    // Attempt 1: Non-admin student calls GET /api/admin/stats
    const studentStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (studentStatsRes.status !== 403) {
      throw new Error(`Task 10.1 Failed: Expected HTTP 403 for non-admin on /admin/stats, got ${studentStatsRes.status}`);
    }
    const studentErrData = await studentStatsRes.json();
    console.log(`Student denied access as expected: HTTP 403 - "${studentErrData.message}"`);

    // Attempt 2: Non-admin student attempts to create a chapter
    const studentCreateRes = await fetch(`${BASE_URL}/admin/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        subjectId: physics._id,
        title: 'Hacked Chapter',
        chapterNumber: 99
      })
    });

    if (studentCreateRes.status !== 403) {
      throw new Error(`Task 10.1 Failed: Expected HTTP 403 for non-admin on POST /admin/chapters, got ${studentCreateRes.status}`);
    }
    console.log('Student blocked from creating chapters: HTTP 403 received.');

    // Attempt 3: Admin calls GET /api/admin/stats
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminStatsRes.status !== 200) {
      throw new Error(`Task 10.1 Failed: Admin expected HTTP 200, got ${adminStatsRes.status}`);
    }
    const adminStatsData = await adminStatsRes.json();
    if (!adminStatsData.success || !adminStatsData.stats) {
      throw new Error('Task 10.1 Failed: Admin stats data missing');
    }
    console.log(`Admin authorized: HTTP 200 with stats: ${JSON.stringify(adminStatsData.stats)}`);
    console.log('✅ Task 10.1 PASSED: requireAdmin strictly blocks non-admins with HTTP 403.');

    // -------------------------------------------------------------
    // Task 10.2: Admin Pages & New Chapter Visibility for Students
    // Done when: a new chapter you add shows up for students.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 10.2: Add Chapter & Verify Student Visibility ---');

    const testChapterTitle = `Magnetic Effects of Electric Current (Phase 10 Test ${Date.now()})`;
    const testChapterTitleHindi = 'विद्युत धारा के चुंबकीय प्रभाव';

    // 1. Admin creates a new chapter
    const addChapterRes = await fetch(`${BASE_URL}/admin/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subjectId: physics._id,
        title: testChapterTitle,
        titleHindi: testChapterTitleHindi,
        chapterNumber: 13,
        description: 'Magnetic fields, field lines, and electromagnetic induction in CBSE Class 10.',
        descriptionHindi: 'चुंबकीय क्षेत्र और विद्युत चुंबकीय प्रेरण।'
      })
    });

    const addChapterData = await addChapterRes.json();
    if (addChapterRes.status !== 201 || !addChapterData.success) {
      throw new Error(`Task 10.2 Failed: Could not create chapter: ${addChapterData.message}`);
    }
    const createdChapterId = addChapterData.chapter._id;
    console.log(`Admin created new chapter: "${addChapterData.chapter.title}" (ID: ${createdChapterId})`);

    // 2. Student queries the public / student endpoint: GET /api/subjects/:id/chapters
    const studentChaptersRes = await fetch(`${BASE_URL}/subjects/${physics._id}/chapters`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentChaptersData = await studentChaptersRes.json();
    const chapterList = Array.isArray(studentChaptersData) ? studentChaptersData : (studentChaptersData.chapters || []);

    if (!Array.isArray(chapterList)) {
      throw new Error('Task 10.2 Failed: Student could not fetch subject chapters');
    }

    const foundForStudent = chapterList.find(c => (c._id || c.id).toString() === createdChapterId.toString());
    if (!foundForStudent) {
      throw new Error(`Task 10.2 Failed: Newly added chapter ${createdChapterId} does not appear in student chapter list!`);
    }

    if (foundForStudent.title !== testChapterTitle || foundForStudent.titleHindi !== testChapterTitleHindi) {
      throw new Error('Task 10.2 Failed: Chapter title mismatch in student query');
    }
    console.log(`Verified: Student immediately sees newly added chapter "${foundForStudent.title}" (Ch ${foundForStudent.chapterNumber}).`);
    console.log('✅ Task 10.2 PASSED: New chapters added by admin show up cleanly for students.');

    // -------------------------------------------------------------
    // Task 10.3: Delete Safely
    // Confirm before deleting content that has student progress.
    // Done when: progress data stays consistent after a delete.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 10.3: Safe Deletion & Progress Data Consistency ---');

    // 1. Add 2 test lessons under this new chapter
    const lesson1Res = await fetch(`${BASE_URL}/admin/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        chapterId: createdChapterId,
        title: 'Magnetic Field and Field Lines',
        titleHindi: 'चुंबकीय क्षेत्र और क्षेत्र रेखाएं',
        lessonNumber: 1,
        summary: 'Properties of magnetic field lines around a straight conductor.',
        contentBlocks: [{ type: 'text', order: 1, content: 'Magnetic field lines are continuous closed loops.' }]
      })
    });
    const lesson1Data = await lesson1Res.json();
    if (!lesson1Data.success || !lesson1Data.lesson) {
      throw new Error(`Failed to create lesson 1: ${lesson1Data.message}`);
    }
    const lesson1Id = lesson1Data.lesson._id;

    const lesson2Res = await fetch(`${BASE_URL}/admin/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        chapterId: createdChapterId,
        title: 'Right-Hand Thumb Rule and Solenoid',
        titleHindi: 'दाएं हाथ के अंगूठे का नियम और परिनालिका',
        lessonNumber: 2,
        summary: 'Direction of induced magnetic field.',
        contentBlocks: [{ type: 'text', order: 1, content: 'Right hand thumb points in direction of current.' }]
      })
    });
    const lesson2Data = await lesson2Res.json();
    if (!lesson2Data.success || !lesson2Data.lesson) {
      throw new Error(`Failed to create lesson 2: ${lesson2Data.message}`);
    }
    const lesson2Id = lesson2Data.lesson._id;

    console.log(`Created 2 lessons for safe deletion test: L1 (${lesson1Id}), L2 (${lesson2Id})`);

    // 2. Student completes Lesson 1
    const completeRes = await fetch(`${BASE_URL}/lessons/${lesson1Id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const completeData = await completeRes.json();
    console.log(`Student completed Lesson 1: Progress is ${completeData.progress.completionPercentage}% (1/2 lessons)`);

    // Verify progress record in MongoDB
    let progressDoc = await Progress.findOne({ userId: student._id, chapterId: createdChapterId });
    if (!progressDoc || progressDoc.completionPercentage !== 50 || progressDoc.completedLessons.length !== 1) {
      throw new Error(`Task 10.3 Failed: Expected 50% completion on chapter before delete test`);
    }

    // 3. Admin attempts to delete Lesson 1 WITHOUT force=true
    console.log('Attempting to delete completed Lesson 1 without force confirmation...');
    const deleteL1Unconfirmed = await fetch(`${BASE_URL}/admin/lessons/${lesson1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (deleteL1Unconfirmed.status !== 409) {
      throw new Error(`Task 10.3 Failed: Expected HTTP 409 Conflict when deleting lesson with active progress without force, got ${deleteL1Unconfirmed.status}`);
    }
    const unconfirmedData = await deleteL1Unconfirmed.json();
    if (!unconfirmedData.requiresConfirmation || unconfirmedData.affectedStudentsCount !== 1) {
      throw new Error('Task 10.3 Failed: 409 response did not contain requiresConfirmation and affectedStudentsCount');
    }
    console.log(`Confirmation triggered: HTTP 409 - "${unconfirmedData.message}"`);

    // 4. Admin confirms deletion with force=true
    console.log('Confirming deletion of Lesson 1 with force=true...');
    const deleteL1Confirmed = await fetch(`${BASE_URL}/admin/lessons/${lesson1Id}?force=true`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (deleteL1Confirmed.status !== 200) {
      throw new Error(`Task 10.3 Failed: Expected HTTP 200 on confirmed delete, got ${deleteL1Confirmed.status}`);
    }

    // Verify Lesson 1 is gone
    const checkLesson1 = await Lesson.findById(lesson1Id);
    if (checkLesson1) {
      throw new Error('Task 10.3 Failed: Lesson 1 still exists in database after confirmed delete');
    }

    // Verify Progress record was automatically updated to stay mathematically consistent!
    // Remaining lessons in chapter = 1 (Lesson 2). Student has 0 completed lessons in chapter.
    progressDoc = await Progress.findOne({ userId: student._id, chapterId: createdChapterId });
    if (progressDoc.completedLessons.some(id => id.toString() === lesson1Id.toString())) {
      throw new Error('Task 10.3 Failed: Deleted lesson ID still present in student completedLessons array (dangling reference)');
    }
    if (progressDoc.totalLessonsCount !== 1 || progressDoc.completionPercentage !== 0) {
      throw new Error(`Task 10.3 Failed: Expected 0% completion with 1 remaining lesson, got ${progressDoc.completionPercentage}% with total ${progressDoc.totalLessonsCount}`);
    }
    console.log(`Progress consistency verified: completedLessons pruned, total updated to ${progressDoc.totalLessonsCount}, completionPercentage recalculated to ${progressDoc.completionPercentage}%.`);

    // 5. Test Chapter Safe Deletion: Attempt to delete chapter WITHOUT force=true
    console.log('\nAttempting to delete chapter with active student progress without force...');
    const deleteChapUnconfirmed = await fetch(`${BASE_URL}/admin/chapters/${createdChapterId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (deleteChapUnconfirmed.status !== 409) {
      throw new Error(`Task 10.3 Failed: Expected HTTP 409 Conflict when deleting chapter with progress without force, got ${deleteChapUnconfirmed.status}`);
    }
    const chapConflictData = await deleteChapUnconfirmed.json();
    console.log(`Chapter deletion confirmation required: HTTP 409 - "${chapConflictData.message}"`);

    // 6. Confirm chapter deletion with force=true
    console.log('Confirming chapter deletion with force=true...');
    const deleteChapConfirmed = await fetch(`${BASE_URL}/admin/chapters/${createdChapterId}?force=true`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (deleteChapConfirmed.status !== 200) {
      throw new Error(`Task 10.3 Failed: Expected HTTP 200 on confirmed chapter delete, got ${deleteChapConfirmed.status}`);
    }

    // Verify child lessons, chapter, and orphan progress records were safely cleaned up
    const remainingProg = await Progress.findOne({ chapterId: createdChapterId });
    const remainingL2 = await Lesson.findById(lesson2Id);
    const remainingChap = await Chapter.findById(createdChapterId);

    if (remainingProg || remainingL2 || remainingChap) {
      throw new Error('Task 10.3 Failed: Orphan chapter, lessons, or progress records remained after cascade deletion');
    }
    console.log('✅ Task 10.3 PASSED: Confirmation required before deleting content with student progress; progress data remains 100% mathematically consistent without dangling pointers.');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 10 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n❌ PHASE 10 TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('Server and DB connection closed.');
  }
}

runPhase10Tests();
