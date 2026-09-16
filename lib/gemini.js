import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Throttling mechanism for Gemini Free Tier (Max 15 requests/minute ~ 1 request every 4 seconds)
let lastCallTimestamp = 0;
const MIN_INTERVAL_MS = 4000; // 4 seconds interval to ensure safe rate limit usage

async function rateLimitThrottle() {
  const now = Date.now();
  const timeSinceLast = now - lastCallTimestamp;
  if (timeSinceLast < MIN_INTERVAL_MS) {
    const delayNeeded = MIN_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delayNeeded));
  }
  lastCallTimestamp = Date.now();
}

/**
 * 1. Food Vision Scanner - Identifies food item(s) from image buffer/base64
 */
export async function analyzeFoodImage(base64Image, mimeType = 'image/jpeg') {
  if (!genAI) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is missing. Please set it in your environment variables.',
      detectedFood: 'Unknown Food (API Key missing)',
      confidence: 0,
      description: 'Gemini API key is required to scan images.'
    };
  }

  await rateLimitThrottle();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a world-class clinical nutritionist and food recognition expert.
Analyze this food image carefully.
Return a JSON object ONLY with the following keys (no markdown blocks, no prose outside JSON):
{
  "foodName": "Primary item name (e.g. Grilled Chicken Salad)",
  "searchKeyword": "Simple clean 1-3 word keyword for USDA API search (e.g. chicken salad)",
  "confidenceScore": 0.95,
  "description": "Short 1-2 sentence nutritional overview",
  "estimatedPortion": "e.g. 1 bowl / 250g",
  "estimatedCalories": 350,
  "estimatedProtein": 30,
  "estimatedCarbs": 15,
  "estimatedFat": 12,
  "estimatedFiber": 4,
  "estimatedSugar": 3,
  "estimatedSodium": 450
}`;

    const imageParts = [
      {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: mimeType
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();

    // Clean JSON response
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return {
      success: true,
      data: parsedData
    };
  } catch (err) {
    console.error('Error analyzing food image with Gemini:', err);
    return {
      success: false,
      error: err.message || 'Failed to analyze food image.',
      detectedFood: 'Unrecognized Dish',
      confidence: 0,
      description: 'Could not process the food image clearly.'
    };
  }
}

/**
 * 2. Specialized Nutrition & Wellness Chatbot
 */
export async function generateChatResponse(messages = [], userProfile = {}) {
  if (!genAI) {
    return {
      success: false,
      reply: '⚠️ Gemini API key is missing. Please add your free GEMINI_API_KEY from Google AI Studio to unlock real AI responses!'
    };
  }

  await rateLimitThrottle();

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are NutriZen AI, an elite, compassionate clinical nutritionist and zen wellness advisor.
User Profile Context:
- Dietary Preference: ${userProfile.dietaryPreference || 'General'}
- Health Goals: ${userProfile.healthGoals || 'General Wellness'}
- Health Concerns: ${(userProfile.healthConcerns || []).join(', ') || 'None reported'}
- Daily Water Target: ${userProfile.waterGoal || 2000} ml

Your mission:
1. Provide evidence-based, clear, motivating nutrition and mindfulness guidance.
2. If a user asks for recipes or food suggestions, include exact macro estimates (Calories, Protein, Carbs, Fats).
3. If they log or mention food bad for their health concern (e.g. high sugar for diabetes, high sodium for hypertension), warn them gently with practical healthy swaps.
4. Keep tone warm, professional, concise, and structured with bullet points.`
    });

    // Format past history for Gemini SDK
    const formattedHistory = messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory.slice(0, -1) // All except latest message
    });

    const latestUserMessage = messages[messages.length - 1]?.content || 'Hello NutriZen AI';
    const result = await chat.sendMessage(latestUserMessage);
    const replyText = result.response.text();

    return {
      success: true,
      reply: replyText
    };
  } catch (err) {
    console.error('Gemini Chat error:', err);
    if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota')) {
      return {
        success: false,
        reply: '⏳ Rate limit reached on Gemini Free Tier. Please wait 10 seconds before asking your next question.'
      };
    }
    return {
      success: false,
      reply: 'I encountered an error generating your recommendation. Please try again in a moment.'
    };
  }
}

/**
 * 3. Real Personalized AI Recommendations
 */
export async function generatePersonalizedRecommendations(foodLogs = [], userProfile = {}, goals = []) {
  if (!genAI) {
    return [
      "Hydrate consistently with at least 2,000ml water daily.",
      "Incorporate 25g-30g protein in every primary meal.",
      "Limit processed sugars to support sustained energy levels."
    ];
  }

  await rateLimitThrottle();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const totalKcal = foodLogs.reduce((acc, f) => acc + (f.calories || 0), 0);
    const totalProt = foodLogs.reduce((acc, f) => acc + (f.protein || 0), 0);
    const totalSugar = foodLogs.reduce((acc, f) => acc + (f.sugar || 0), 0);
    const totalSodium = foodLogs.reduce((acc, f) => acc + (f.sodium || 0), 0);

    const prompt = `Analyze this user's nutrition data today and generate 3 actionable, personalized recommendations.
User Data:
- Health Goal: ${userProfile.healthGoals || 'Wellness'}
- Health Concerns: ${(userProfile.healthConcerns || []).join(', ') || 'None'}
- Today Total Consumed: ${totalKcal} kcal, ${totalProt}g Protein, ${totalSugar}g Sugar, ${totalSodium}mg Sodium.
- Active Goals Checklist: ${goals.map(g => g.text).join('; ') || 'None'}

Return a JSON array of strings ONLY:
[
  "Recommendation 1...",
  "Recommendation 2...",
  "Recommendation 3..."
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to generate AI recommendations:', err);
    return [
      "Maintain active hydration targets throughout the day.",
      "Pair complex carbohydrates with lean protein sources.",
      "Ensure 7-8 hours of sleep for optimal metabolic recovery."
    ];
  }
}
