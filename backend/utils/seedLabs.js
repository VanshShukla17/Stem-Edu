const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Lab = require('../models/Lab');
const Subject = require('../models/Subject');

const labData = {
  title: 'Simple Pendulum Experiment',
  titleHindi: 'सरल लोलक प्रयोग: आवर्तकाल की निर्भरता',
  experimentType: 'simple_pendulum',
  description: 'Investigate how the time period of a simple pendulum depends on string length, bob mass, and the local acceleration due to gravity. Verify the simple harmonic motion equation T = 2π√(L/g).',
  descriptionHindi: 'जांचें कि एक सरल लोलक का आवर्तकाल डोरी की लंबाई, गोलक के द्रव्यमान और गुरुत्वीय त्वरण पर कैसे निर्भर करता है। T = 2π√(L/g) सूत्र की पुष्टि करें।',
  instructions: [
    'Adjust the String Length (L) slider from 0.2m to 2.0m and observe how the swing frequency changes.',
    'Vary the Bob Mass (m) from 0.05kg to 1.0kg to test whether mass influences the oscillation duration.',
    'Switch between Earth (9.8 m/s²), Moon (1.62 m/s²), and Jupiter (24.79 m/s²) gravity environments.',
    'Use the Pause / Resume and Slow Motion toggles to inspect the instantaneous position and velocity at the turning points.',
    'Answer the 3 observation quiz questions below to test your scientific deductions.'
  ],
  instructionsHindi: [
    'डोरी की लंबाई (L) को 0.2m से 2.0m तक बदलें और देखें कि दोलन आवृत्ति कैसे बदलती है।',
    'गोलक का द्रव्यमान (m) 0.05kg से 1.0kg तक बदलकर जांचें कि क्या द्रव्यमान आवर्तकाल को प्रभावित करता है।',
    'पृथ्वी (9.8 m/s²), चंद्रमा (1.62 m/s²), और बृहस्पति (24.79 m/s²) के गुरुत्वाकर्षण विकल्पों में तुलना करें।',
    'लोलक की गति को ध्यान से देखने के लिए रोकें / चलाएं और स्लो मोशन का उपयोग करें।',
    'अपने वैज्ञानिक निष्कर्षों की जांच के लिए नीचे दिए गए 3 प्रश्नों के उत्तर दें।'
  ],
  variables: [
    {
      name: 'length',
      label: 'String Length (L)',
      labelHindi: 'डोरी की लंबाई (L)',
      unit: 'm',
      min: 0.2,
      max: 2.0,
      step: 0.05,
      defaultValue: 1.0
    },
    {
      name: 'mass',
      label: 'Bob Mass (m)',
      labelHindi: 'गोलक का द्रव्यमान (m)',
      unit: 'kg',
      min: 0.05,
      max: 1.0,
      step: 0.05,
      defaultValue: 0.2
    },
    {
      name: 'gravity',
      label: 'Gravity (g)',
      labelHindi: 'गुरुत्वीय त्वरण (g)',
      unit: 'm/s²',
      min: 1.62,
      max: 24.79,
      step: 0.01,
      defaultValue: 9.8
    },
    {
      name: 'angle',
      label: 'Release Angle (θ₀)',
      labelHindi: 'प्रारंभिक कोण (θ₀)',
      unit: '°',
      min: 5,
      max: 25,
      step: 1,
      defaultValue: 12
    }
  ],
  observationQuestions: [
    {
      question: 'If you quadruple the length of a pendulum string (from 0.25 m to 1.0 m), what happens to its time period?',
      questionHindi: 'यदि आप लोलक की डोरी की लंबाई 4 गुना कर दें (0.25 m से 1.0 m), तो इसके आवर्तकाल पर क्या प्रभाव पड़ेगा?',
      options: [
        'It is halved',
        'It doubles (increases by 2x)',
        'It quadruples (increases by 4x)',
        'It remains completely unchanged'
      ],
      optionsHindi: [
        'यह आधा हो जाता है',
        'यह दोगुना हो जाता है (2x)',
        'यह चार गुना हो जाता है (4x)',
        'यह पूरी तरह अपरिवर्तित रहता है'
      ],
      correctIndex: 1,
      explanation: 'Because T = 2π√(L/g), the period is directly proportional to √L. If L increases by 4x, T increases by √4 = 2x (it doubles).'
    },
    {
      question: 'How does increasing the mass of the pendulum bob from 50 g to 500 g affect the period of oscillation?',
      questionHindi: 'गोलक के द्रव्यमान को 50 ग्राम से बढ़ाकर 500 ग्राम करने पर दोलन काल पर क्या प्रभाव पड़ता है?',
      options: [
        'Period increases by 10x',
        'Period decreases by 10x',
        'Period remains completely unchanged',
        'Period depends on the bob material density'
      ],
      optionsHindi: [
        'आवर्तकाल 10 गुना बढ़ जाता है',
        'आवर्तकाल 10 गुना घट जाता है',
        'आवर्तकाल पूरी तरह अपरिवर्तित रहता है',
        'आवर्तकाल गोलक के घनत्व पर निर्भर करता है'
      ],
      correctIndex: 2,
      explanation: 'The formula T = 2π√(L/g) contains no mass parameter m. In small-angle simple harmonic motion, period is completely independent of the mass of the bob.'
    },
    {
      question: 'On the Moon, where gravity is ~1/6th that of Earth (1.62 m/s²), how does the pendulum swing compared to Earth?',
      questionHindi: 'चंद्रमा पर, जहां गुरुत्वीय त्वरण पृथ्वी का ~1/6 (1.62 m/s²) है, लोलक पृथ्वी की तुलना में कैसा दोलन करेगा?',
      options: [
        'It swings much faster with a shorter period',
        'It swings much slower with a longer period',
        'It swings at the exact same frequency',
        'It stops oscillating entirely'
      ],
      optionsHindi: [
        'यह बहुत तेजी से और छोटे आवर्तकाल के साथ दोलन करेगा',
        'यह बहुत धीमे और लंबे आवर्तकाल के साथ दोलन करेगा',
        'यह बिल्कुल उसी आवृत्ति पर दोलन करेगा',
        'यह पूरी तरह रुक जाता है'
      ],
      correctIndex: 1,
      explanation: 'Since g is in the denominator under the square root (T ∝ 1/√g), lower gravitational acceleration results in a longer period T, making the pendulum oscillate much slower.'
    }
  ]
};

async function seedLabs() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stem-edu';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB for lab seeding');
    }

    // Find Physics subject
    let physics = await Subject.findOne({ code: 'physics' });
    if (!physics) {
      console.log('Physics subject not found. Creating placeholder Physics subject...');
      physics = await Subject.create({
        name: 'Physics',
        nameHindi: 'भौतिक विज्ञान',
        code: 'physics',
        classLevel: 10,
        board: 'CBSE',
        color: '#2563EB',
        icon: 'Atom',
        description: 'Explore the fundamental principles governing matter, energy, light, and electricity.'
      });
    }

    // Seed or update the Simple Pendulum lab
    const updatedLab = await Lab.findOneAndUpdate(
      { experimentType: 'simple_pendulum' },
      {
        ...labData,
        subjectId: physics._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Seeded Virtual Lab: "${updatedLab.title}" (ID: ${updatedLab._id})`);
    return updatedLab;
  } catch (error) {
    console.error('Error seeding virtual labs:', error);
    throw error;
  }
}

if (require.main === module) {
  seedLabs()
    .then(() => {
      console.log('Virtual lab seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedLabs;

