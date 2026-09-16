import { analyzeFoodImage } from '@/lib/gemini';
import { searchUSDAFood } from '@/lib/usda';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image base64 data is required.' });
    }

    // Step 1: Gemini Vision Analysis
    const geminiResult = await analyzeFoodImage(image, mimeType || 'image/jpeg');

    if (!geminiResult.success) {
      return res.status(200).json({
        success: false,
        detectedFood: geminiResult.detectedFood || 'Unrecognized Item',
        error: geminiResult.error,
        confidence: 0,
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      });
    }

    const visionData = geminiResult.data;
    const searchKeyword = visionData.searchKeyword || visionData.foodName;

    // Step 2: Fetch real USDA Nutrition data
    const usdaNutrition = await searchUSDAFood(searchKeyword);

    // Merge AI Vision estimates with real USDA data
    const finalNutrition = {
      foodName: visionData.foodName,
      confidenceScore: visionData.confidenceScore || 0.92,
      description: visionData.description,
      estimatedPortion: visionData.estimatedPortion || '1 serving',
      calories: usdaNutrition.calories || visionData.estimatedCalories || 250,
      protein: usdaNutrition.protein || visionData.estimatedProtein || 15,
      carbs: usdaNutrition.carbs || visionData.estimatedCarbs || 25,
      fat: usdaNutrition.fat || visionData.estimatedFat || 10,
      fiber: usdaNutrition.fiber || visionData.estimatedFiber || 3,
      sugar: usdaNutrition.sugar || visionData.estimatedSugar || 4,
      sodium: usdaNutrition.sodium || visionData.estimatedSodium || 350,
      usdaMatch: usdaNutrition.foodName || searchKeyword
    };

    return res.status(200).json({
      success: true,
      data: finalNutrition
    });
  } catch (error) {
    console.error('Food scanner endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to scan food image.',
      error: error.message
    });
  }
}
