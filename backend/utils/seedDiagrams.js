/**
 * Seed Script for Interactive Diagrams (Tasks 8.4, 8.5, 8.6, 8.7)
 * Populates Biology (Plant Cell), Chemistry (Periodic Elements), and Physics (Electric Circuit)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Diagram = require('../models/Diagram');
const Lesson = require('../models/Lesson');

const diagramsData = [
  {
    title: 'Plant Cell Anatomy',
    titleHindi: 'पादप कोशिका की संरचना',
    subjectCode: 'biology',
    svgViewBox: '0 0 600 400',
    elements: [
      {
        id: 'cell_wall',
        label: 'Cell Wall',
        labelHindi: 'कोशिका भित्ति',
        shape: 'rect',
        attributes: { x: 30, y: 30, width: 540, height: 340, rx: 30, fill: '#DCFCE7', stroke: '#15803D', strokeWidth: 8 },
        explanation: 'Rigid outer layer made of cellulose that provides structural support, shape, and protection to the plant cell.',
        explanationHindi: 'सेल्यूलोज से बनी कठोर बाहरी परत जो पादप कोशिका को संरचनात्मक सहारा, निश्चित आकार और सुरक्षा प्रदान करती है।'
      },
      {
        id: 'cell_membrane',
        label: 'Cell Membrane',
        labelHindi: 'कोशिका झिल्ली',
        shape: 'rect',
        attributes: { x: 44, y: 44, width: 512, height: 312, rx: 22, fill: '#F0FDF4', stroke: '#22C55E', strokeWidth: 3 },
        explanation: 'Selectively permeable membrane that regulates the entry and exit of ions, nutrients, and water.',
        explanationHindi: 'अर्ध-पारगम्य झिल्ली जो कोशिका के अंदर और बाहर पदार्थों के आवागमन को नियंत्रित करती है।'
      },
      {
        id: 'vacuole',
        label: 'Central Vacuole',
        labelHindi: 'केंद्रीय रसधानी',
        shape: 'rect',
        attributes: { x: 180, y: 90, width: 240, height: 180, rx: 40, fill: '#E0F2FE', stroke: '#0284C7', strokeWidth: 4 },
        explanation: 'Large fluid-filled organelle storing water, sugars, and mineral salts; maintains turgor pressure against the cell wall.',
        explanationHindi: 'कोशिका रस से भरी विशाल रसधानी जो जल व खनिजों का संचय करती है तथा कोशिका को स्फीति प्रदान करती है।'
      },
      {
        id: 'nucleus',
        label: 'Nucleus',
        labelHindi: 'केंद्रक',
        shape: 'circle',
        attributes: { cx: 110, y: 150, r: 42, fill: '#F3E8FF', stroke: '#7C3AED', strokeWidth: 4 },
        explanation: 'The control centre of the cell containing genetic material (DNA/chromosomes) that coordinates growth, protein synthesis, and division.',
        explanationHindi: 'कोशिका का नियंत्रण केंद्र जिसमें आनुवंशिक पदार्थ (DNA) होता है, जो कोशिका की समस्त जैविक क्रियाओं को नियंत्रित करता है।'
      },
      {
        id: 'chloroplast_1',
        label: 'Chloroplast',
        labelHindi: 'हरितलवक (क्लोरोप्लास्ट)',
        shape: 'circle',
        attributes: { cx: 470, y: 120, r: 30, fill: '#86EFAC', stroke: '#16A34A', strokeWidth: 3 },
        explanation: 'Contains chlorophyll pigment that traps solar light energy to synthesize food via photosynthesis.',
        explanationHindi: 'इसमें क्लोरोफिल वर्णक होता है जो सौर ऊर्जा को अवशोषित करके प्रकाश संश्लेषण द्वारा भोजन का निर्माण करता है।'
      },
      {
        id: 'chloroplast_2',
        label: 'Chloroplast',
        labelHindi: 'हरितलवक (क्लोरोप्लास्ट)',
        shape: 'circle',
        attributes: { cx: 470, y: 240, r: 30, fill: '#86EFAC', stroke: '#16A34A', strokeWidth: 3 },
        explanation: 'Double-membrane organelle containing thylakoids where the light-dependent reactions of photosynthesis occur.',
        explanationHindi: 'दोहरी झिल्ली वाला अंगक जिसमें प्रकाश संश्लेषण की प्रकाशिक अभिक्रियाएं संपन्न होती हैं।'
      },
      {
        id: 'mitochondrion',
        label: 'Mitochondrion',
        labelHindi: 'माइटोकॉन्ड्रिया',
        shape: 'rect',
        attributes: { x: 90, y: 260, width: 65, height: 35, rx: 17, fill: '#FED7AA', stroke: '#EA580C', strokeWidth: 3 },
        explanation: 'The powerhouse of the cell; produces ATP (cellular energy currency) through cellular aerobic respiration.',
        explanationHindi: 'कोशिका का ऊर्जाघर (Powerhouse); कोशिकीय श्वसन द्वारा ATP के रूप में ऊर्जा उत्पन्न करता है।'
      }
    ]
  },
  {
    title: 'Periodic Table Element Groups',
    titleHindi: 'आवर्त सारणी: प्रमुख तत्व समूह',
    subjectCode: 'chemistry',
    svgViewBox: '0 0 600 400',
    elements: [
      {
        id: 'alkali_metals',
        label: 'Alkali Metals (Group 1)',
        labelHindi: 'क्षार धातुएं (समूह 1)',
        shape: 'rect',
        attributes: { x: 30, y: 50, width: 95, height: 300, rx: 10, fill: '#FEE2E2', stroke: '#DC2626', strokeWidth: 3 },
        explanation: 'Group 1 elements (Lithium, Sodium, Potassium). Soft, highly reactive metals with 1 valence electron, readily forming +1 cations.',
        explanationHindi: 'समूह 1 के तत्व (Li, Na, K)। अत्यधिक क्रियाशील धातुएं जिनमें 1 संयोजी इलेक्ट्रॉन होता है और +1 धनायन बनाती हैं।'
      },
      {
        id: 'alkaline_earth',
        label: 'Alkaline Earth Metals (Group 2)',
        labelHindi: 'क्षारीय मृदा धातुएं (समूह 2)',
        shape: 'rect',
        attributes: { x: 135, y: 110, width: 95, height: 240, rx: 10, fill: '#FFEDD5', stroke: '#EA580C', strokeWidth: 3 },
        explanation: 'Group 2 elements (Magnesium, Calcium). Reactive metals with 2 valence electrons, forming basic hydroxides.',
        explanationHindi: 'समूह 2 के तत्व (Mg, Ca)। इनमें 2 संयोजी इलेक्ट्रॉन होते हैं और क्षारीय हाइड्रॉक्साइड बनाते हैं।'
      },
      {
        id: 'transition_metals',
        label: 'Transition Metals',
        labelHindi: 'संक्रमण तत्व',
        shape: 'rect',
        attributes: { x: 240, y: 160, width: 130, height: 190, rx: 10, fill: '#FEF3C7', stroke: '#D97706', strokeWidth: 3 },
        explanation: 'D-block metals (Iron, Copper, Zinc) that exhibit variable oxidation states, high melting points, and form coloured compounds.',
        explanationHindi: 'd-ब्लॉक के तत्व (Fe, Cu, Zn) जो परिवर्तनीय संयोजकता प्रदर्शित करते हैं और उत्प्रेरक के रूप में उपयोगी हैं।'
      },
      {
        id: 'halogens',
        label: 'Halogens (Group 17)',
        labelHindi: 'हैलोजन (समूह 17)',
        shape: 'rect',
        attributes: { x: 380, y: 70, width: 90, height: 280, rx: 10, fill: '#E0E7FF', stroke: '#4F46E5', strokeWidth: 3 },
        explanation: 'Group 17 non-metals (Fluorine, Chlorine, Bromine, Iodine). Highly electronegative with 7 valence electrons; gain 1 electron to form salts.',
        explanationHindi: 'समूह 17 के अधातु तत्व (F, Cl, Br, I)। 7 संयोजी इलेक्ट्रॉनों के साथ तीव्र ऋणविद्युती तत्व जो लवण बनाते हैं।'
      },
      {
        id: 'noble_gases',
        label: 'Noble Gases (Group 18)',
        labelHindi: 'उत्कृष्ट गैसें (समूह 18)',
        shape: 'rect',
        attributes: { x: 480, y: 50, width: 90, height: 300, rx: 10, fill: '#F3E8FF', stroke: '#9333EA', strokeWidth: 3 },
        explanation: 'Group 18 elements (Helium, Neon, Argon). Completely filled valence electron shells (stable octet); chemically inert under normal conditions.',
        explanationHindi: 'समूह 18 के तत्व (He, Ne, Ar)। पूर्ण अष्टक वाली अक्रिय गैसें जो सामान्य परिस्थितियों में रासायनिक क्रिया नहीं करतीं।'
      }
    ]
  },
  {
    title: 'Simple Electric Circuit',
    titleHindi: 'सरल विद्युत परिपथ',
    subjectCode: 'physics',
    svgViewBox: '0 0 600 400',
    elements: [
      {
        id: 'battery',
        label: 'Battery / Cell Source',
        labelHindi: 'बैटरी / विद्युत सेल',
        shape: 'rect',
        attributes: { x: 250, y: 310, width: 100, height: 40, rx: 8, fill: '#EFF6FF', stroke: '#2563EB', strokeWidth: 4 },
        explanation: 'Chemical power source maintaining an electric potential difference (voltage) across the circuit to drive electron flow.',
        explanationHindi: 'विद्युत स्रोत जो परिपथ के सिरों पर विभवांतर (V) बनाए रखता है जिससे धारा प्रवाहित होती है।'
      },
      {
        id: 'switch_key',
        label: 'Plug Key / Switch',
        labelHindi: 'प्लग कुंजी / स्विच',
        shape: 'circle',
        attributes: { cx: 480, y: 330, r: 24, fill: '#F1F5F9', stroke: '#475569', strokeWidth: 4 },
        explanation: 'A conducting link used to open or close the circuit. When closed, current flows continuously.',
        explanationHindi: 'परिपथ को चालू या बंद करने वाली कुंजी। बंद होने पर धारा निरंतर बहती है।'
      },
      {
        id: 'ammeter',
        label: 'Ammeter (Current Meter)',
        labelHindi: 'एमीटर (धारामापी)',
        shape: 'circle',
        attributes: { cx: 500, y: 190, r: 32, fill: '#FEF3C7', stroke: '#D97706', strokeWidth: 4 },
        explanation: 'Low-resistance instrument always connected in series to measure electric current (I) in Amperes.',
        explanationHindi: 'कम प्रतिरोध वाला उपकरण जिसे परिपथ में श्रेणीक्रम में जोड़कर धारा (एम्पीयर में) मापी जाती है।'
      },
      {
        id: 'resistor',
        label: 'Resistor (Resistance R)',
        labelHindi: 'प्रतिरोधक (प्रतिरोध R)',
        shape: 'rect',
        attributes: { x: 230, y: 40, width: 140, height: 40, rx: 6, fill: '#FEE2E2', stroke: '#DC2626', strokeWidth: 4 },
        explanation: 'Component that opposes the flow of electric charge, converting electrical energy into heat according to V = IR.',
        explanationHindi: 'चालक घटक जो विद्युत धारा के प्रवाह में अवरोध उत्पन्न करता है (V = IR)।'
      },
      {
        id: 'voltmeter',
        label: 'Voltmeter (Voltage Meter)',
        labelHindi: 'वोल्टमीटर (विभवांतरमापी)',
        shape: 'circle',
        attributes: { cx: 300, y: 130, r: 28, fill: '#DCFCE7', stroke: '#16A34A', strokeWidth: 4 },
        explanation: 'High-resistance instrument connected in parallel across the resistor to measure potential difference in Volts.',
        explanationHindi: 'उच्च प्रतिरोध वाला उपकरण जिसे प्रतिरोधक के पार्श्वक्रम में जोड़कर विभवांतर (वोल्ट में) मापा जाता है।'
      },
      {
        id: 'electric_bulb',
        label: 'Electric Bulb / Load',
        labelHindi: 'विद्युत बल्ब',
        shape: 'circle',
        attributes: { cx: 100, y: 190, r: 30, fill: '#FEF08A', stroke: '#CA8A04', strokeWidth: 4 },
        explanation: 'Load device with a thin tungsten filament that glows due to the heating effect of electric current.',
        explanationHindi: 'टंगस्टन तंतु वाला प्रकाश स्रोत जो धारा के तापीय प्रभाव से दीप्त होकर प्रकाश देता है।'
      }
    ]
  }
];

async function seedDiagrams() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stem-edu';
    await mongoose.connect(uri);
    console.log('Connected to DB for seeding interactive diagrams...');

    for (const d of diagramsData) {
      let diagram = await Diagram.findOne({ subjectCode: d.subjectCode });
      if (!diagram) {
        diagram = await Diagram.create(d);
        console.log(`Created Diagram: ${diagram.title} (${diagram.subjectCode})`);
      } else {
        Object.assign(diagram, d);
        await diagram.save();
        console.log(`Updated Diagram: ${diagram.title}`);
      }

      // Task 8.7: Embed diagram in matching lesson
      if (d.subjectCode === 'physics') {
        const lesson = await Lesson.findOne({ title: 'Electric Current and Simple Circuits' });
        if (lesson) {
          // Check if diagram block already exists
          const hasDiagramBlock = lesson.contentBlocks.some(b => b.type === 'diagram');
          if (!hasDiagramBlock) {
            lesson.contentBlocks.push({
              type: 'diagram',
              content: 'Interactive Simple Electric Circuit: Tap any component to learn its role.',
              contentHindi: 'सरल विद्युत परिपथ: किसी भी घटक पर टैप करके उसकी भूमिका जानें।',
              diagramId: diagram._id
            });
            lesson.diagramId = diagram._id;
            await lesson.save();
            console.log(`Linked diagram to lesson: ${lesson.title}`);
          }
        }
      }

      if (d.subjectCode === 'biology') {
        const lesson = await Lesson.findOne({ title: 'Nutrition in Plants and Animals' });
        if (lesson) {
          const hasDiagramBlock = lesson.contentBlocks.some(b => b.type === 'diagram');
          if (!hasDiagramBlock) {
            lesson.contentBlocks.push({
              type: 'diagram',
              content: 'Plant Cell Anatomy: Explore organelles and their functions by touch.',
              contentHindi: 'पादप कोशिका की संरचना: स्पर्श करके अंगकों के कार्य जानें।',
              diagramId: diagram._id
            });
            lesson.diagramId = diagram._id;
            await lesson.save();
            console.log(`Linked diagram to lesson: ${lesson.title}`);
          }
        }
      }
    }

    console.log('✅ Interactive diagrams seeded successfully!');
  } catch (error) {
    console.error('Error seeding diagrams:', error);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedDiagrams();
}

module.exports = seedDiagrams;
