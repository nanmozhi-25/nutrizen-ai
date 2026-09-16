import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nutrizen_jwt_secret_key_2026_super_secure';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      profile: {
        age: 25,
        gender: 'Not specified',
        height: 170,
        weight: 70,
        bmi: 24.2,
        activityLevel: 'Moderate',
        dietaryPreference: 'Balanced',
        allergies: [],
        healthGoals: 'Maintain Health',
        waterGoal: 2000,
        sleepGoal: 8.0,
        meditationGoal: 15
      }
    });

    // Create token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
