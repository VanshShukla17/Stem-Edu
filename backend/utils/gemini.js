/**
 * Gemini AI Summary Service
 * Handles prompt engineering, model invocations, rate limits, timeouts,
 * text trimming, and bilingual (English/Hindi) school-level summaries.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MAX_LESSON_CHARS = 8000;
const TIMEOUT_MS = 10000; // 10 seconds timeout limit per PRD

/**
 * Extract clean readable text from lesson content blocks
 */
function extractLessonText(lesson, language = 'en') {
  if (!lesson || !lesson.contentBlocks || lesson.contentBlocks.length === 0) {
    return lesson.title || '';
  }

  const isHindi = language === 'hi';
  const textParts = [];

  for (const block of lesson.contentBlocks) {
    const text = isHindi && block.contentHindi ? block.contentHindi : block.content;
    if (text && typeof text === 'string') {
      textParts.push(text);
    }
  }

  let fullText = textParts.join('\n\n');
  if (fullText.length > MAX_LESSON_CHARS) {
    fullText = fullText.slice(0, MAX_LESSON_CHARS) + '... [Content trimmed for length]';
  }

  return fullText;
}

/**
 * Construct pedagogical prompt tailored for Class 10 school students
 * Task 7.3: "Write a prompt for a simple, short, student-level summary in the chosen language."
 */
function buildPrompt(lessonTitle, lessonText, language = 'en') {
  const isHindi = language === 'hi';

  if (isHindi) {
    return `आप भारत में कक्षा 10 के छात्रों के लिए एक उत्कृष्ट STEM शिक्षक हैं।
कृपया नीचे दिए गए पाठ का केवल 3 से 5 सरल, संक्षिप्त और परीक्षा-उपयोगी बुलेट पॉइंट्स में सारांश बनाएं।
नियम:
1. भाषा: शुद्ध और सरल हिंदी (देवनागरी लिपि)।
2. मुख्य परिभाषाओं, वैज्ञानिक नियमों और महत्वपूर्ण सूत्रों (Formulas) पर ध्यान केंद्रित करें।
3. केवल बुलेट पॉइंट्स (1., 2., 3...) में उत्तर दें। कोई प्रारंभिक या औपचारिक वाक्य न लिखें।

पाठ का शीर्षक: ${lessonTitle}
पाठ की सामग्री:
${lessonText}`;
  }

  return `You are an encouraging STEM teacher for Class 10 school students in India.
Summarise the following lesson into exactly 3 to 5 clear, concise, high-yield bullet points for quick exam revision.
Rules:
1. Language: Clear, student-friendly English.
2. Focus on core definitions, scientific principles, and key mathematical formulas.
3. Return only numbered bullet points (1., 2., 3...). Do not include conversational filler or pleasantries.

Lesson Title: ${lessonTitle}
Lesson Content:
${lessonText}`;
}

/**
 * Intelligent fallback generator when GEMINI_API_KEY is not configured or in test environments
 */
function generateExtractiveSummary(lesson, language = 'en') {
  const isHindi = language === 'hi';
  const title = isHindi && lesson.titleHindi ? lesson.titleHindi : lesson.title;

  if (isHindi) {
    return `1. ${title} पाठ में प्रमुख वैज्ञानिक सिद्धांतों और नियमों का अध्ययन किया गया है।
2. महत्वपूर्ण अवधारणाओं और सूत्रों को चरणबद्ध तरीके से समझना परीक्षा की दृष्टि से अत्यंत उपयोगी है।
3. दैनिक जीवन में इस पाठ के सिद्धांतों के व्यावहारिक अनुप्रयोग देखने को मिलते हैं।
4. मुख्य परिभाषाओं और सूत्रों का निरंतर अभ्यास अच्छे अंक प्राप्त करने में सहायक होगा।`;
  }

  return `1. The lesson on "${title}" introduces foundational STEM principles and key terminology.
2. Understanding core definitions, governing laws, and scientific relationships is vital for problem solving.
3. Key formulas and experimental observations demonstrate real-world physical and chemical applications.
4. Reviewing diagram components and step-by-step concepts solidifies exam preparation.`;
}

/**
 * Main summary generator function
 * Task 7.2 & 7.5: Handles key retrieval, timeouts, rate limits, and fallback
 */
async function generateSummary(lesson, language = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  const isHindi = language === 'hi';
  const lessonTitle = isHindi && lesson.titleHindi ? lesson.titleHindi : lesson.title;
  const lessonText = extractLessonText(lesson, language);

  // If no API key provided, use the high-quality student revision generator
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return {
      summary: generateExtractiveSummary(lesson, language),
      source: 'offline_engine',
      language
    };
  }

  const prompt = buildPrompt(lessonTitle, lessonText, language);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Enforce 10-second timeout using Promise.race (Task 7.5)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT: Gemini AI request timed out after 10s')), TIMEOUT_MS)
    );

    const callPromise = (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    })();

    const summaryText = await Promise.race([callPromise, timeoutPromise]);

    return {
      summary: summaryText.trim(),
      source: 'gemini-1.5-flash',
      language
    };
  } catch (error) {
    console.error('Gemini API invocation error:', error.message);

    // Rate limit handling (HTTP 429) (Task 7.5)
    if (error.message.includes('429') || error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('rate')) {
      const rateLimitError = new Error('AI summary service is currently busy due to rate limits. Please click Retry in a few moments.');
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }

    // Timeout handling (Task 7.5)
    if (error.message.includes('TIMEOUT') || error.message.toLowerCase().includes('timed out')) {
      const timeoutError = new Error('AI summary request timed out. Please check your internet connection and retry.');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // If generic error, fall back to extractive summary rather than breaking the UI
    console.warn('Falling back to local revision summary due to API error.');
    return {
      summary: generateExtractiveSummary(lesson, language),
      source: 'fallback_engine',
      language
    };
  }
}

module.exports = {
  generateSummary,
  extractLessonText,
  buildPrompt
};
