import { searchUSDAFood } from '@/lib/usda';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query parameter is required.' });
    }

    const usdaResult = await searchUSDAFood(query);
    return res.status(200).json(usdaResult);
  } catch (error) {
    console.error('USDA API search error:', error);
    return res.status(500).json({ message: 'Failed to query USDA FoodData Central API.', error: error.message });
  }
}
