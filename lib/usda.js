const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * Search USDA FoodData Central for food items by keyword
 */
export async function searchUSDAFood(query) {
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const url = `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${cleanQuery}&pageSize=5&dataType=Foundation,SR%20Legacy,Branded`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`USDA API HTTP error: ${res.status}`);
      return getFallbackNutrition(query);
    }

    const data = await res.json();
    if (!data.foods || data.foods.length === 0) {
      return getFallbackNutrition(query);
    }

    // Pick top matching food item
    const topFood = data.foods[0];
    const nutrients = topFood.foodNutrients || [];

    // Extract macros using USDA nutrient IDs / names
    const findNutrient = (namePatterns) => {
      const found = nutrients.find(n => 
        namePatterns.some(p => (n.nutrientName || '').toLowerCase().includes(p.toLowerCase()))
      );
      return found ? Math.round(found.value || 0) : 0;
    };

    return {
      success: true,
      foodName: topFood.description || query,
      fdcId: topFood.fdcId,
      calories: findNutrient(['Energy', 'Calories']),
      protein: findNutrient(['Protein']),
      carbs: findNutrient(['Carbohydrate, by difference', 'Carbohydrate']),
      fat: findNutrient(['Total lipid (fat)', 'Fat']),
      fiber: findNutrient(['Fiber, total dietary', 'Fiber']),
      sugar: findNutrient(['Sugars, total including NLEA', 'Sugars', 'Sugar']),
      sodium: findNutrient(['Sodium, Na', 'Sodium'])
    };
  } catch (err) {
    console.error('Error fetching USDA data:', err);
    return getFallbackNutrition(query);
  }
}

function getFallbackNutrition(query) {
  return {
    success: false,
    foodName: query,
    calories: 220,
    protein: 15,
    carbs: 25,
    fat: 8,
    fiber: 3,
    sugar: 4,
    sodium: 300,
    isFallback: true
  };
}
