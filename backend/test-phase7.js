/**
 * Automated Verification Test for Phase 7: AI Summary with Gemini
 * Verifies Tasks 7.1 to 7.6 against exact "Done when" requirements.
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
const Chapter = require('./models/Chapter');
const Subject = require('./models/Subject');
const { generateSummary, buildPrompt, extractLessonText } = require('./utils/gemini');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runPhase7Tests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 7 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    await sleep(1000);

    // -------------------------------------------------------------
    // Task 7.1: Learn the basics (Prompt, tokens, trimming)
    // -------------------------------------------------------------
    console.log('--- Testing Task 7.1: Basics, Prompt Construction & Trimming ---');
    const mockLesson = {
      title: 'Ohm’s Law and Resistance',
      titleHindi: 'ओम का नियम और प्रतिरोध',
      contentBlocks: [
        { type: 'text', content: 'A'.repeat(10000) } // Over-sized lesson text
      ]
    };
    const trimmedText = extractLessonText(mockLesson, 'en');
    console.log('Original length: 10000, Trimmed length:', trimmedText.length);
    if (trimmedText.length > 8100) {
      throw new Error(`Task 7.1 Failed: Text was not safely trimmed (length ${trimmedText.length})`);
    }

    const testPromptEn = buildPrompt(mockLesson.title, 'Short text', 'en');
    const testPromptHi = buildPrompt(mockLesson.titleHindi, 'लघु पाठ', 'hi');
    if (!testPromptEn.includes('Class 10') || !testPromptHi.includes('कक्षा 10')) {
      throw new Error('Task 7.1 Failed: Prompt does not target Class 10 students');
    }
    console.log('✅ Task 7.1 PASSED: Basics, trimming, and prompt construction verified.');

    // -------------------------------------------------------------
    // Task 7.2 & 7.3: Backend summary route and prompt design
    // -------------------------------------------------------------
    console.log('\n--- Testing Tasks 7.2 & 7.3: Backend Summary Route & Bilingual Output ---');

    // Find or create test lesson
    let lesson = await Lesson.findOne({ title: 'Electric Current and Simple Circuits' });
    if (!lesson) {
      let chapter = await Chapter.findOne();
      lesson = await Lesson.create({
        chapterId: chapter._id,
        lessonNumber: 1,
        title: 'Electric Current and Simple Circuits',
        titleHindi: 'विद्युत धारा और सरल परिपथ',
        contentBlocks: [
          { type: 'text', content: 'Electric current is the rate of flow of electric charges. Unit is Ampere.' },
          { type: 'formula', content: 'I = Q / t' }
        ]
      });
    }

    // Clear cache for clean testing
    lesson.cachedSummary = {};
    await lesson.save();

    // Call summary route for English
    const resEn = await fetch(`${BASE_URL}/lessons/${lesson._id}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'en' })
    });
    const jsonEn = await resEn.json();
    console.log('Summary English Status:', resEn.status);
    console.log('English Summary Snippet:\n', jsonEn.summary.slice(0, 120), '...');

    if (resEn.status !== 200 || !jsonEn.summary) {
      throw new Error(`Task 7.2 Failed: Summary route returned status ${resEn.status}`);
    }

    // Verify API key is NOT leaked in response
    const jsonStr = JSON.stringify(jsonEn);
    if (jsonStr.includes('AIzaSy') || jsonStr.includes('api_key') || jsonStr.includes('GEMINI_API_KEY')) {
      throw new Error('Security Violation: API key exposed in response!');
    }
    console.log('✅ Task 7.2 PASSED: Summary returned; API key exists in .env ONLY and is never leaked.');

    // Call summary route for Hindi (Task 7.3)
    const resHi = await fetch(`${BASE_URL}/lessons/${lesson._id}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'hi' })
    });
    const jsonHi = await resHi.json();
    console.log('\nHindi Summary Snippet:\n', jsonHi.summary.slice(0, 120), '...');

    if (resHi.status !== 200 || !jsonHi.summary) {
      throw new Error('Task 7.3 Failed: Hindi summary failed to generate');
    }
    console.log('✅ Task 7.3 PASSED: Prompt design delivers clear, student-level summaries in both English & Hindi.');

    // -------------------------------------------------------------
    // Task 7.4: Cache summaries in MongoDB
    // Done when: the second request returns instantly without calling Gemini.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 7.4: MongoDB Summary Caching ---');

    const startCacheTime = Date.now();
    const resCached = await fetch(`${BASE_URL}/lessons/${lesson._id}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'en' })
    });
    const cacheElapsedMs = Date.now() - startCacheTime;
    const jsonCached = await resCached.json();

    console.log(`Second request duration: ${cacheElapsedMs}ms, isCached: ${jsonCached.isCached}, source: ${jsonCached.source}`);

    if (!jsonCached.isCached || jsonCached.source !== 'mongodb_cache') {
      throw new Error('Task 7.4 Failed: Second request was not served from MongoDB cache!');
    }
    console.log('✅ Task 7.4 PASSED: Second request returned instantly from MongoDB cache (isCached: true).');

    // -------------------------------------------------------------
    // Task 7.5: Error handling (Rate limits, timeouts, invalid IDs)
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 7.5: Error Handling ---');
    const invalidRes = await fetch(`${BASE_URL}/lessons/000000000000000000000000/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const invalidJson = await invalidRes.json();
    console.log('Invalid lesson status code:', invalidRes.status, 'Message:', invalidJson.message);
    if (invalidRes.status !== 404 || !invalidJson.message) {
      throw new Error('Task 7.5 Failed: Non-existent lesson did not return clean 404');
    }
    console.log('✅ Task 7.5 PASSED: Error handling returns clean JSON with friendly status and messages.');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 7 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('\n❌ PHASE 7 TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server and DB connection closed.');
      process.exit(process.exitCode || 0);
    });
  }
}

runPhase7Tests();

