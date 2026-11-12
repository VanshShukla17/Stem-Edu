/**
 * Seed Script for STEM Edu Demo Content
 * Populates 4 Subjects, 4 Chapters (one per subject), 4 Lessons each, and 5 MCQs per chapter.
 * Safe to run multiple times (idempotent).
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');

const demoData = [
  {
    subject: {
      name: 'Physics',
      nameHindi: 'भौतिक विज्ञान',
      code: 'physics',
      description: 'Study of matter, energy, electricity, magnetism, and the physical universe.',
      descriptionHindi: 'पदार्थ, ऊर्जा, विद्युत, चुंबकत्व और भौतिक ब्रह्मांड का अध्ययन।',
      icon: 'Atom',
      color: '#2563EB',
      classLevel: 10,
      board: 'CBSE',
      order: 1
    },
    chapter: {
      chapterNumber: 12,
      title: 'Electricity',
      titleHindi: 'विद्युत',
      description: 'Electric current, potential difference, Ohm’s law, resistance, and heating effects.',
      descriptionHindi: 'विद्युत धारा, विभवांतर, ओम का नियम, प्रतिरोध और तापीय प्रभाव।',
      classLevel: 10,
      board: 'CBSE',
      order: 1
    },
    lessons: [
      {
        lessonNumber: 1,
        title: 'Electric Current and Simple Circuits',
        titleHindi: 'विद्युत धारा और सरल विद्युत परिपथ',
        contentBlocks: [
          {
            type: 'text',
            content: 'An electric current is expressed by the amount of charge flowing through a particular area in unit time. In other words, it is the rate of flow of electric charges. In circuits using metallic wires, electrons constitute the flow of charges.',
            contentHindi: 'विद्युत आवेश के प्रवाह की दर को विद्युत धारा कहते हैं। धात्विक तारों वाले परिपथों में इलेक्ट्रॉनों का प्रवाह ही धारा बनाता है।'
          },
          {
            type: 'formula',
            content: 'I = Q / t  (where I is Current in Amperes, Q is Charge in Coulombs, t is Time in seconds)',
            contentHindi: 'I = Q / t  (जहाँ I धारा (एम्पीयर), Q आवेश (कूलॉम), t समय (सेकंड) है)'
          },
          {
            type: 'image',
            content: 'Schematic diagram of an electric circuit with battery, ammeter, bulb, and switch key.',
            contentHindi: 'बैटरी, एमीटर, बल्ब और कुंजी युक्त विद्युत परिपथ का योजनाबद्ध आरेख।',
            mediaUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80'
          }
        ],
        order: 1
      },
      {
        lessonNumber: 2,
        title: 'Electric Potential and Potential Difference',
        titleHindi: 'विद्युत विभव और विभवांतर',
        contentBlocks: [
          {
            type: 'text',
            content: 'For flow of charges in a conducting metallic wire, the electrons move only if there is a difference of electric pressure – called the potential difference – along the conductor.',
            contentHindi: 'किसी चालक तार में आवेश तभी प्रवाहित होते हैं जब उसके सिरों के बीच विद्युत दाब का अंतर (विभवांतर) होता है।'
          },
          {
            type: 'formula',
            content: 'V = W / Q  (where V is Potential Difference in Volts, W is Work Done in Joules, Q is Charge in Coulombs)',
            contentHindi: 'V = W / Q  (V विभवांतर (वोल्ट), W किया गया कार्य (जूल), Q आवेश (कूलॉम))'
          }
        ],
        order: 2
      },
      {
        lessonNumber: 3,
        title: "Ohm's Law and Electrical Resistance",
        titleHindi: 'ओम का नियम और विद्युत प्रतिरोध',
        contentBlocks: [
          {
            type: 'text',
            content: 'Ohm’s law states that the potential difference (V) across the ends of a given metallic wire in an electric circuit is directly proportional to the current (I) flowing through it, provided its temperature remains the same.',
            contentHindi: 'ओम के नियम के अनुसार, एक नियत ताप पर किसी चालक के सिरों के बीच का विभवांतर (V) उसमें प्रवाहित धारा (I) के समानुपाती होता है।'
          },
          {
            type: 'formula',
            content: 'V = I × R  or  R = V / I  (where R is Resistance measured in Ohms Ω)',
            contentHindi: 'V = I × R  या  R = V / I  (जहाँ R प्रतिरोध है जिसका मात्रक ओम Ω है)'
          }
        ],
        order: 3
      },
      {
        lessonNumber: 4,
        title: 'Heating Effect of Current and Electric Power',
        titleHindi: 'विद्युत धारा का तापीय प्रभाव और विद्युत शक्ति',
        contentBlocks: [
          {
            type: 'text',
            content: 'When an electric current passes through a high resistance wire like nichrome, the wire becomes very hot and produces heat. This is known as the heating effect of electric current.',
            contentHindi: 'जब विद्युत धारा नाइक्रोम जैसे उच्च प्रतिरोध वाले तार से गुजरती है, तो तार गर्म हो जाता है और ऊष्मा उत्पन्न करता है। इसे विद्युत धारा का तापीय प्रभाव कहते हैं।'
          },
          {
            type: 'formula',
            content: "H = I² × R × t (Joule's Law of Heating) and P = V × I (Power in Watts)",
            contentHindi: 'H = I² × R × t (जूल का तापन नियम) तथा P = V × I (शक्ति वाट में)'
          }
        ],
        order: 4
      }
    ],
    questions: [
      {
        questionText: 'What is the SI unit of electric current?',
        questionTextHindi: 'विद्युत धारा का SI मात्रक क्या है?',
        options: ['Volt', 'Ampere', 'Ohm', 'Joule'],
        optionsHindi: ['वोल्ट', 'एम्पीयर', 'ओम', 'जूल'],
        correctOptionIndex: 1,
        explanation: 'The SI unit of electric current is Ampere (A), defined as one coulomb of charge per second.'
      },
      {
        questionText: 'Which mathematical formula expresses Ohm’s Law?',
        questionTextHindi: 'ओम के नियम का गणितीय रूप कौन सा है?',
        options: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
        optionsHindi: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
        correctOptionIndex: 1,
        explanation: 'According to Ohm’s law, potential difference V is directly proportional to current I, so V = IR.'
      },
      {
        questionText: 'How does doubling the length of a wire affect its electrical resistance?',
        questionTextHindi: 'तार की लंबाई दोगुनी करने पर उसके प्रतिरोध पर क्या प्रभाव पड़ेगा?',
        options: ['Resistance halves', 'Resistance doubles', 'Resistance quadruples', 'Resistance remains unchanged'],
        optionsHindi: ['प्रतिरोध आधा हो जाएगा', 'प्रतिरोध दोगुना हो जाएगा', 'प्रतिरोध चार गुना हो जाएगा', 'प्रतिरोध अपरिवर्तित रहेगा'],
        correctOptionIndex: 1,
        explanation: 'Resistance is directly proportional to length (R ∝ L). Doubling length doubles resistance.'
      },
      {
        questionText: 'What instrument is used to measure electric current in a circuit?',
        questionTextHindi: 'परिपथ में विद्युत धारा मापने के लिए किस यंत्र का उपयोग किया जाता है?',
        options: ['Voltmeter', 'Ammeter', 'Galvanometer', 'Rheostat'],
        optionsHindi: ['वोल्टमीटर', 'एमीटर', 'गैल्वेनोमीटर', 'धारा नियंत्रक'],
        correctOptionIndex: 1,
        explanation: 'An ammeter is always connected in series to measure electric current.'
      },
      {
        questionText: 'Which of the following represents Joule’s Law of Heating?',
        questionTextHindi: 'निम्न में से कौन सा जूल के तापन नियम को दर्शाता है?',
        options: ['H = I × R × t', 'H = I² × R × t', 'H = V / R', 'H = I / (R × t)'],
        optionsHindi: ['H = I × R × t', 'H = I² × R × t', 'H = V / R', 'H = I / (R × t)'],
        correctOptionIndex: 1,
        explanation: 'Heat produced is directly proportional to the square of current: H = I²Rt.'
      }
    ]
  },
  {
    subject: {
      name: 'Chemistry',
      nameHindi: 'रसायन विज्ञान',
      code: 'chemistry',
      description: 'Study of substances, chemical reactions, molecular structures, and bonding.',
      descriptionHindi: 'पदार्थों, रासायनिक अभिक्रियाओं, आणविक संरचनाओं और बंधों का अध्ययन।',
      icon: 'FlaskConical',
      color: '#7C3AED',
      classLevel: 10,
      board: 'CBSE',
      order: 2
    },
    chapter: {
      chapterNumber: 1,
      title: 'Chemical Reactions and Equations',
      titleHindi: 'रासायनिक अभिक्रियाएं एवं समीकरण',
      description: 'Balancing chemical equations, combination, decomposition, displacement, and redox reactions.',
      descriptionHindi: 'रासायनिक समीकरणों को संतुलित करना, संयोजन, वियोजन, विस्थापन और रेडॉक्स अभिक्रियाएं।',
      classLevel: 10,
      board: 'CBSE',
      order: 1
    },
    lessons: [
      {
        lessonNumber: 1,
        title: 'Chemical Equations and Balancing',
        titleHindi: 'रासायनिक समीकरण और उनका संतुलन',
        contentBlocks: [
          {
            type: 'text',
            content: 'A chemical reaction involves breaking old chemical bonds and forming new bonds to produce substances with entirely new properties.',
            contentHindi: 'रासायनिक अभिक्रिया में पुराने रासायनिक बंध टूटते हैं और नए बंध बनते हैं।'
          }
        ],
        order: 1
      }
    ],
    questions: [
      {
        questionText: 'What type of reaction is 2H₂ + O₂ → 2H₂O?',
        questionTextHindi: '2H₂ + O₂ → 2H₂O किस प्रकार की अभिक्रिया है?',
        options: ['Decomposition', 'Combination', 'Displacement', 'Double Displacement'],
        optionsHindi: ['वियोजन', 'संयोजन', 'विस्थापन', 'द्विविस्थापन'],
        correctOptionIndex: 1,
        explanation: 'Two reactants combine to form a single product, which defines a combination reaction.'
      },
      {
        questionText: 'Rusting of iron is an example of which chemical process?',
        questionTextHindi: 'लोहे पर जंग लगना किस रासायनिक प्रक्रिया का उदाहरण है?',
        options: ['Reduction', 'Oxidation and Corrosion', 'Decomposition', 'Displacement'],
        optionsHindi: ['अपचयन', 'उपचयन और संक्षारण', 'वियोजन', 'विस्थापन'],
        correctOptionIndex: 1,
        explanation: 'Rusting involves iron reacting with oxygen and moisture, causing oxidation and corrosion.'
      }
    ]
  },
  {
    subject: {
      name: 'Biology',
      nameHindi: 'जीव विज्ञान',
      code: 'biology',
      description: 'Study of living organisms, life processes, cellular biology, and ecosystems.',
      descriptionHindi: 'जीवों, जीवन प्रक्रियाओं, कोशिकीय जीव विज्ञान और पारिस्थितिकी तंत्र का अध्ययन।',
      icon: 'Dna',
      color: '#16A34A',
      classLevel: 10,
      board: 'CBSE',
      order: 3
    },
    chapter: {
      chapterNumber: 6,
      title: 'Life Processes',
      titleHindi: 'जैव प्रक्रम',
      description: 'Fundamental processes maintaining life: nutrition, respiration, transportation, and excretion.',
      descriptionHindi: 'जीवन को बनाए रखने वाले मूलभूत प्रक्रम: पोषण, श्वसन, वहन और उत्सर्जन।',
      classLevel: 10,
      board: 'CBSE',
      order: 1
    },
    lessons: [
      {
        lessonNumber: 1,
        title: 'Nutrition in Plants and Animals',
        titleHindi: 'पादपों और जंतुओं में पोषण',
        contentBlocks: [
          {
            type: 'text',
            content: 'Life processes are the essential basic functions performed by living organisms to sustain life on Earth.',
            contentHindi: 'जैव प्रक्रम वे मूलभूत क्रियाएं हैं जो जीवों के जीवन को बनाए रखने के लिए आवश्यक हैं।'
          }
        ],
        order: 1
      }
    ],
    questions: [
      {
        questionText: 'What is the structural and functional filtration unit of the human kidney?',
        questionTextHindi: 'मानव वृक्क की संरचनात्मक और क्रियात्मक निस्पंदन इकाई क्या है?',
        options: ['Neuron', 'Nephron', 'Alveoli', 'Villi'],
        optionsHindi: ['न्यूरॉन', 'नेफ्रॉन', 'कूपिका', 'दीर्घरोम'],
        correctOptionIndex: 1,
        explanation: 'Nephrons are microscopic filtering units in the kidneys that filter blood and form urine.'
      },
      {
        questionText: 'Which chamber of the human heart pumps oxygen-rich blood to the entire body?',
        questionTextHindi: 'मानव हृदय का कौन सा कोष्ठ पूरे शरीर में ऑक्सीजन युक्त रक्त पंप करता है?',
        options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'],
        optionsHindi: ['दायाँ आलिंद', 'दायाँ निलय', 'बायाँ आलिंद', 'बायाँ निलय'],
        correctOptionIndex: 3,
        explanation: 'The left ventricle has thick muscular walls to pump oxygenated blood through the aorta to the body.'
      }
    ]
  },
  {
    subject: {
      name: 'Mathematics',
      nameHindi: 'गणित',
      code: 'mathematics',
      description: 'Study of numbers, geometry, algebra, trigonometry, and arithmetic proofs.',
      descriptionHindi: 'संख्याओं, ज्यामिति, बीजगणित, त्रिकोणमिति और अंकगणितीय उपपत्तियों का अध्ययन।',
      icon: 'Calculator',
      color: '#CA8A04',
      classLevel: 10,
      board: 'CBSE',
      order: 4
    },
    chapter: {
      chapterNumber: 1,
      title: 'Real Numbers',
      titleHindi: 'वास्तविक संख्याएं',
      description: 'Fundamental Theorem of Arithmetic, HCF and LCM, and proofs of irrationality.',
      descriptionHindi: 'अंकगणित की आधारभूत प्रमेय, HCF और LCM, तथा अपरिमेय संख्याओं का सत्यापन।',
      classLevel: 10,
      board: 'CBSE',
      order: 1
    },
    lessons: [
      {
        lessonNumber: 1,
        title: 'Fundamental Theorem of Arithmetic',
        titleHindi: 'अंकगणित की आधारभूत प्रमेय',
        contentBlocks: [
          {
            type: 'text',
            content: 'Every composite number can be uniquely expressed as a product of primes.',
            contentHindi: 'प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के एक अद्वितीय गुणनफल के रूप में व्यक्त किया जा सकता है।'
          }
        ],
        order: 1
      }
    ],
    questions: [
      {
        questionText: 'If HCF(a, b) = 4 and a × b = 96, what is LCM(a, b)?',
        questionTextHindi: 'यदि HCF(a, b) = 4 तथा a × b = 96 हो, तो LCM(a, b) क्या होगा?',
        options: ['12', '24', '384', '48'],
        optionsHindi: ['12', '24', '384', '48'],
        correctOptionIndex: 1,
        explanation: 'HCF × LCM = a × b => 4 × LCM = 96 => LCM = 96 / 4 = 24.'
      },
      {
        questionText: 'Which of the following numbers is irrational?',
        questionTextHindi: 'निम्न में से कौन सी संख्या अपरिमेय है?',
        options: ['3.14', '√4', '√3', '22/7'],
        optionsHindi: ['3.14', '√4', '√3', '22/7'],
        correctOptionIndex: 2,
        explanation: '√3 cannot be expressed as a fraction of integers p/q, hence it is irrational.'
      }
    ]
  }
];

async function seedDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stem-edu';
    await mongoose.connect(uri);
    console.log('Connected to DB for seeding demo curriculum...');

    for (const item of demoData) {
      // 1. Upsert Subject
      let subject = await Subject.findOne({ code: item.subject.code });
      if (!subject) {
        subject = await Subject.create(item.subject);
        console.log(`Created Subject: ${subject.name}`);
      } else {
        Object.assign(subject, item.subject);
        await subject.save();
      }

      // 2. Upsert Chapter
      let chapter = await Chapter.findOne({
        subjectId: subject._id,
        chapterNumber: item.chapter.chapterNumber
      });
      if (!chapter) {
        chapter = await Chapter.create({
          ...item.chapter,
          subjectId: subject._id
        });
        console.log(`Created Chapter: ${chapter.title} for ${subject.name}`);
      } else {
        Object.assign(chapter, { ...item.chapter, subjectId: subject._id });
        await chapter.save();
      }

      // 3. Upsert Lessons
      for (const lessonData of item.lessons) {
        let lesson = await Lesson.findOne({
          chapterId: chapter._id,
          lessonNumber: lessonData.lessonNumber
        });
        if (!lesson) {
          lesson = await Lesson.create({
            ...lessonData,
            chapterId: chapter._id
          });
        } else {
          Object.assign(lesson, { ...lessonData, chapterId: chapter._id });
          await lesson.save();
        }
      }

      // 4. Upsert Questions
      for (const qData of item.questions) {
        let q = await Question.findOne({
          chapterId: chapter._id,
          questionText: qData.questionText
        });
        if (!q) {
          await Question.create({
            ...qData,
            chapterId: chapter._id
          });
          console.log(`Created Question: ${qData.questionText.slice(0, 30)}...`);
        }
      }
    }

    console.log('✅ Demo content seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
