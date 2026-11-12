/**
 * Seed Script for STEM Edu Demo Content
 * Populates 4 Subjects, 4 Chapters (one per subject), and 4 Lessons each.
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
          },
          {
            type: 'callout',
            content: 'Key Fact: The SI unit of electric charge is coulomb (C), which is equivalent to the charge contained in nearly 6 × 10¹⁸ electrons.',
            contentHindi: 'मुख्य तथ्य: विद्युत आवेश का SI मात्रक कूलॉम (C) है, जो लगभग 6 × 10¹⁸ इलेक्ट्रॉनों में समाहित आवेश के बराबर होता है।'
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
        explanation: 'The SI unit of electric current is Ampere (A), named after André-Marie Ampère.'
      },
      {
        questionText: 'Which mathematical formula expresses Ohm’s Law?',
        questionTextHindi: 'ओम के नियम का गणितीय रूप कौन सा है?',
        options: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
        optionsHindi: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
        correctOptionIndex: 1,
        explanation: 'According to Ohm’s law, potential difference is directly proportional to current, hence V = IR.'
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
            content: 'A chemical reaction involves breaking old chemical bonds and forming new bonds to produce substances with entirely new properties. The Law of Conservation of Mass requires that atoms of each element remain equal on both sides.',
            contentHindi: 'रासायनिक अभिक्रिया में पुराने रासायनिक बंध टूटते हैं और नए बंध बनते हैं। द्रव्यमान संरक्षण के नियम के अनुसार दोनों पक्षों में प्रत्येक तत्व के परमाणुओं की संख्या बराबर होनी चाहिए।'
          }
        ],
        order: 1
      },
      {
        lessonNumber: 2,
        title: 'Combination and Decomposition Reactions',
        titleHindi: 'संयोजन एवं वियोजन अभिक्रियाएं',
        contentBlocks: [
          {
            type: 'text',
            content: 'In a combination reaction, two or more reactants combine to form a single product. In a decomposition reaction, a single compound breaks down into two or more simpler substances.',
            contentHindi: 'संयोजन अभिक्रिया में दो या दो से अधिक अभिकारक मिलकर एकल उत्पाद बनाते हैं। वियोजन अभिक्रिया में एकल यौगिक दो या अधिक सरल पदार्थों में टूटता है।'
          }
        ],
        order: 2
      },
      {
        lessonNumber: 3,
        title: 'Displacement and Double Displacement',
        titleHindi: 'विस्थापन एवं द्विविस्थापन अभिक्रियाएं',
        contentBlocks: [
          {
            type: 'text',
            content: 'A displacement reaction occurs when a more reactive element displaces a less reactive element from its compound. In double displacement, ions are exchanged between two reactants.',
            contentHindi: 'विस्थापन अभिक्रिया में अधिक क्रियाशील तत्व कम क्रियाशील तत्व को उसके यौगिक से विस्थापित करता है। द्विविस्थापन में आयनों का आदान-प्रदान होता है।'
          }
        ],
        order: 3
      },
      {
        lessonNumber: 4,
        title: 'Oxidation, Reduction, and Corrosion',
        titleHindi: 'उपचयन, अपचयन और संक्षारण',
        contentBlocks: [
          {
            type: 'text',
            content: 'Oxidation is the gain of oxygen or loss of electrons. Reduction is the loss of oxygen or gain of electrons. When metals react with moisture and acids over time, corrosion occurs.',
            contentHindi: 'उपचयन (ऑक्सीकरण) में ऑक्सीजन की वृद्धि या इलेक्ट्रॉनों की हानि होती है। अपचयन में ऑक्सीजन का ह्रास होता है। नमी और अम्ल के संपर्क में आने पर धातु का संक्षारण होता है।'
          }
        ],
        order: 4
      }
    ],
    questions: [
      {
        questionText: 'What type of reaction is 2H₂ + O₂ → 2H₂O?',
        questionTextHindi: '2H₂ + O₂ → 2H₂O किस प्रकार की अभिक्रिया है?',
        options: ['Decomposition', 'Combination', 'Displacement', 'Double Displacement'],
        optionsHindi: ['वियोजन', 'संयोजन', 'विस्थापन', 'द्विविस्थापन'],
        correctOptionIndex: 1,
        explanation: 'Two elements combine to form a single product (water), so it is a combination reaction.'
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
            content: 'Life processes are the essential basic functions performed by living organisms to sustain life on Earth. Autotrophic nutrition in plants synthesizes glucose through photosynthesis.',
            contentHindi: 'जैव प्रक्रम वे मूलभूत क्रियाएं हैं जो जीवों के जीवन को बनाए रखने के लिए आवश्यक हैं। पादप प्रकाश संश्लेषण द्वारा भोजन बनाते हैं।'
          }
        ],
        order: 1
      },
      {
        lessonNumber: 2,
        title: 'Respiration and Energy Release',
        titleHindi: 'श्वसन और ऊर्जा उत्पादन',
        contentBlocks: [
          {
            type: 'text',
            content: 'Respiration involves the breakdown of glucose to release cellular energy in the form of ATP. It can be aerobic (with oxygen) or anaerobic (without oxygen).',
            contentHindi: 'श्वसन में ग्लूकोज के विखंडन द्वारा ATP के रूप में ऊर्जा मुक्त होती है। यह वायवीय या अवायवीय हो सकता है।'
          }
        ],
        order: 2
      },
      {
        lessonNumber: 3,
        title: 'Transportation in Humans (The Heart)',
        titleHindi: 'मानव में वहन (हृदय और रक्त परिसंचरण)',
        contentBlocks: [
          {
            type: 'text',
            content: 'The human heart is a muscular pumping organ with four chambers: two atria and two ventricles. Humans exhibit double circulation: pulmonary and systemic.',
            contentHindi: 'मानव हृदय एक पेशीय अंग है जिसमें चार कोष्ठ होते हैं: दो आलिंद और दो निलय। मानव में दोहरा परिसंचरण होता है।'
          }
        ],
        order: 3
      },
      {
        lessonNumber: 4,
        title: 'Excretion in Humans (The Kidneys)',
        titleHindi: 'मानव में उत्सर्जन (वृक्क और नेफ्रॉन)',
        contentBlocks: [
          {
            type: 'text',
            content: 'The excretory system of human beings consists of a pair of kidneys, ureters, a urinary bladder, and a urethra. The structural filtration units are nephrons.',
            contentHindi: 'मानव उत्सर्जन तंत्र में एक जोड़ा वृक्क, मूत्रवाहिनी, मूत्राशय और मूत्रमार्ग होते हैं। वृक्क की निस्पंदन इकाई नेफ्रॉन कहलाती है।'
          }
        ],
        order: 4
      }
    ],
    questions: [
      {
        questionText: 'What is the structural and functional filtration unit of the human kidney?',
        questionTextHindi: 'मानव वृक्क की संरचनात्मक और क्रियात्मक निस्पंदन इकाई क्या है?',
        options: ['Neuron', 'Nephron', 'Alveoli', 'Villi'],
        optionsHindi: ['न्यूरॉन', 'नेफ्रॉन', 'कूपिका', 'दीर्घरोम'],
        correctOptionIndex: 1,
        explanation: 'Nephrons are the microscopic filtration units inside the kidneys.'
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
            content: 'Every composite number can be uniquely expressed (factorised) as a product of primes, apart from the order in which the prime factors occur.',
            contentHindi: 'प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के एक गुणनफल के रूप में व्यक्त किया जा सकता है, तथा यह गुणनखंडन अद्वितीय होता है।'
          }
        ],
        order: 1
      },
      {
        lessonNumber: 2,
        title: 'Finding HCF and LCM by Prime Factorisation',
        titleHindi: 'अभाज्य गुणनखंडन द्वारा HCF और LCM ज्ञात करना',
        contentBlocks: [
          {
            type: 'text',
            content: 'For any two positive integers a and b: HCF(a, b) × LCM(a, b) = a × b. HCF is the product of the smallest power of each common prime factor.',
            contentHindi: 'किन्हीं दो धनात्मक पूर्णांकों a और b के लिए: HCF(a, b) × LCM(a, b) = a × b होता है।'
          }
        ],
        order: 2
      },
      {
        lessonNumber: 3,
        title: 'Proofs of Irrational Numbers (√2, √3, √5)',
        titleHindi: 'अपरिमेय संख्याओं का सत्यापन (√2, √3, √5)',
        contentBlocks: [
          {
            type: 'text',
            content: 'Proof by contradiction: We assume √2 is rational (p/q with no common factors) and show that p and q must both be divisible by 2, leading to a contradiction.',
            contentHindi: 'विरोधाभास द्वारा उपपत्ति: हम मानते हैं कि √2 परिमेय है और सिद्ध करते हैं कि यह धारणा असत्य है।'
          }
        ],
        order: 3
      },
      {
        lessonNumber: 4,
        title: 'Decimal Expansions of Rational Numbers',
        titleHindi: 'परिमेय संख्याओं के दशमलव प्रसार',
        contentBlocks: [
          {
            type: 'text',
            content: 'A rational number p/q has a terminating decimal expansion if the prime factorisation of q is of the form 2ⁿ · 5ᵐ, where n and m are non-negative integers.',
            contentHindi: 'परिमेय संख्या p/q का दशमलव प्रसार सांत होता है यदि q के अभाज्य गुणनखंड 2ⁿ · 5ᵐ के रूप के हों।'
          }
        ],
        order: 4
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
          console.log(`Created Lesson: ${lesson.title}`);
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
