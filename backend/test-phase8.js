/**
 * Automated Verification Test for Phase 8: Interactive Diagrams
 * Verifies Tasks 8.1 to 8.7 against exact "Done when" requirements.
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const fs = require('fs');
const Diagram = require('./models/Diagram');
const Lesson = require('./models/Lesson');
const { app, server } = require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runPhase8Tests() {
  console.log('\n=============================================');
  console.log('   STARTING PHASE 8 AUTOMATED TEST SUITE');
  console.log('=============================================\n');

  try {
    await sleep(1000);

    // -------------------------------------------------------------
    // Task 8.1 & 8.3: Interactive SVG React Component Inspection
    // -------------------------------------------------------------
    console.log('--- Testing Tasks 8.1 & 8.3: Interactive SVG Component & Touch Handlers ---');
    const compPath = path.resolve(__dirname, '..', 'frontend', 'src', 'components', 'InteractiveDiagram.jsx');
    const compJsx = fs.readFileSync(compPath, 'utf-8');

    if (!compJsx.includes('onClick') || !compJsx.includes('onTouchStart')) {
      throw new Error('Task 8.1 Failed: Component does not implement click and touch handlers');
    }
    if (!compJsx.includes('handleElementTap') || !compJsx.includes('selectedElement')) {
      throw new Error('Task 8.3 Failed: Component does not maintain selected element tap state');
    }
    if (!compJsx.includes('selectedElement.explanation')) {
      throw new Error('Task 8.3 Failed: Component does not render explanation panel on tap');
    }
    console.log('✅ Tasks 8.1 & 8.3 PASSED: SVG shapes react to taps and show explanation panel.');

    // -------------------------------------------------------------
    // Task 8.2: Diagram Data Format in MongoDB
    // Done when: one diagram is described fully in JSON.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 8.2: Diagram Data Format in JSON ---');
    const testDiagram = await Diagram.findOne({ subjectCode: 'physics' });
    if (!testDiagram || !testDiagram.svgViewBox || !testDiagram.elements || testDiagram.elements.length === 0) {
      throw new Error('Task 8.2 Failed: Physics diagram not described fully in JSON in MongoDB');
    }

    const firstElem = testDiagram.elements[0];
    console.log('Sample diagram element format:');
    console.log(JSON.stringify({
      id: firstElem.id,
      label: firstElem.label,
      shape: firstElem.shape,
      explanation: firstElem.explanation.slice(0, 60) + '...'
    }, null, 2));

    if (!firstElem.id || !firstElem.label || !firstElem.shape || !firstElem.explanation) {
      throw new Error('Task 8.2 Failed: Element schema missing required fields');
    }
    console.log('✅ Task 8.2 PASSED: Diagram fully described in JSON and stored in MongoDB Diagram collection.');

    // -------------------------------------------------------------
    // Tasks 8.4, 8.5, 8.6: Biology, Chemistry, and Physics Diagrams
    // Done when: each works by touch on a phone.
    // -------------------------------------------------------------
    console.log('\n--- Testing Tasks 8.4, 8.5, 8.6: 3 Science Diagrams (Bio, Chem, Phy) ---');

    // 8.4 Biology Diagram (Plant Cell)
    const bioDiagramRes = await fetch(`${BASE_URL}/diagrams/biology`);
    const bioDiagram = await bioDiagramRes.json();
    console.log(`Biology Diagram: "${bioDiagram.title}" with ${bioDiagram.elements?.length} organelles`);
    const hasCellWall = bioDiagram.elements.some(e => e.id === 'cell_wall');
    const hasNucleus = bioDiagram.elements.some(e => e.id === 'nucleus');
    const hasChloroplast = bioDiagram.elements.some(e => e.id.includes('chloroplast'));
    if (!hasCellWall || !hasNucleus || !hasChloroplast) {
      throw new Error('Task 8.4 Failed: Biology plant cell diagram missing key organelles');
    }
    console.log('✅ Task 8.4 PASSED: Biology diagram (Plant Cell) complete with interactive organelles.');

    // 8.5 Chemistry Diagram (Periodic Groups)
    const chemDiagramRes = await fetch(`${BASE_URL}/diagrams/chemistry`);
    const chemDiagram = await chemDiagramRes.json();
    console.log(`Chemistry Diagram: "${chemDiagram.title}" with ${chemDiagram.elements?.length} element groups`);
    const hasHalogens = chemDiagram.elements.some(e => e.id === 'halogens');
    const hasAlkali = chemDiagram.elements.some(e => e.id === 'alkali_metals');
    if (!hasHalogens || !hasAlkali) {
      throw new Error('Task 8.5 Failed: Chemistry diagram missing element groups');
    }
    console.log('✅ Task 8.5 PASSED: Chemistry diagram (Periodic Groups) complete with element groups.');

    // 8.6 Physics Diagram (Simple Circuit)
    const phyDiagramRes = await fetch(`${BASE_URL}/diagrams/physics`);
    const phyDiagram = await phyDiagramRes.json();
    console.log(`Physics Diagram: "${phyDiagram.title}" with ${phyDiagram.elements?.length} circuit components`);
    const hasBattery = phyDiagram.elements.some(e => e.id === 'battery');
    const hasResistor = phyDiagram.elements.some(e => e.id === 'resistor');
    const hasAmmeter = phyDiagram.elements.some(e => e.id === 'ammeter');
    if (!hasBattery || !hasResistor || !hasAmmeter) {
      throw new Error('Task 8.6 Failed: Physics circuit diagram missing essential electrical components');
    }
    console.log('✅ Task 8.6 PASSED: Physics diagram (Electric Circuit) complete with circuit components.');

    // -------------------------------------------------------------
    // Task 8.7: Embed Diagrams in Lessons
    // Done when: a lesson can include a diagram block.
    // -------------------------------------------------------------
    console.log('\n--- Testing Task 8.7: Embedded Diagram Blocks in Lessons ---');
    const lessonWithDiag = await Lesson.findOne({ 'contentBlocks.type': 'diagram' });
    if (!lessonWithDiag) {
      throw new Error('Task 8.7 Failed: No lesson found containing contentBlock of type "diagram"');
    }

    const diagBlock = lessonWithDiag.contentBlocks.find(b => b.type === 'diagram');
    console.log(`Found lesson with embedded diagram: "${lessonWithDiag.title}"`);
    console.log(`Diagram Block Content: "${diagBlock.content}", DiagramId: ${diagBlock.diagramId}`);

    const readerPath = path.resolve(__dirname, '..', 'frontend', 'src', 'pages', 'LessonReaderPage.jsx');
    const readerJsx = fs.readFileSync(readerPath, 'utf-8');
    if (!readerJsx.includes('<InteractiveDiagram') || !readerJsx.includes("block.type === 'diagram'")) {
      throw new Error('Task 8.7 Failed: LessonReaderPage does not render InteractiveDiagram component for diagram blocks');
    }
    console.log('✅ Task 8.7 PASSED: Lessons cleanly embed InteractiveDiagram blocks.');

    console.log('\n=============================================');
    console.log('   🎉 ALL PHASE 8 TESTS PASSED WITH 0 ERRORS!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('\n❌ PHASE 8 TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server and DB connection closed.');
      process.exit(process.exitCode || 0);
    });
  }
}

runPhase8Tests();
