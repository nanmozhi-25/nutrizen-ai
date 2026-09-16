import connectToDatabase from '@/lib/mongodb';
import FoodLog from '@/models/FoodLog';
import User from '@/models/User';
import Goal from '@/models/Goal';
import HealthConcern from '@/models/HealthConcern';
import { generatePersonalizedRecommendations } from '@/lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  await connectToDatabase();

  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch user logs & context from MongoDB
    const foodLogs = await FoodLog.find({ userId, date: today });
    const user = await User.findById(userId);
    const goals = await Goal.find({ userId });
    const healthConcern = await HealthConcern.findOne({ userId, active: true });

    const userProfile = {
      healthGoals: user?.profile?.healthGoals || 'Maintain Health',
      dietaryPreference: user?.profile?.dietaryPreference || 'Balanced',
      healthConcerns: healthConcern?.concernType !== 'none' ? [healthConcern.concernType] : []
    };

    // Generate real AI recommendation strings
    const recommendations = await generatePersonalizedRecommendations(foodLogs, userProfile, goals);

    return res.status(200).json({
      success: true,
      recommendations,
      stats: {
        loggedTodayCount: foodLogs.length,
        totalCalories: foodLogs.reduce((acc, f) => acc + (f.calories || 0), 0),
        totalProtein: foodLogs.reduce((acc, f) => acc + (f.protein || 0), 0)
      }
    });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    return res.status(500).json({ message: err.message });
  }
}
