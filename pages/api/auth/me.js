import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nutrizen_jwt_secret_key_2026_super_secure';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }

  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { profile } = req.body;
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (profile) {
        user.profile = { ...user.profile.toObject(), ...profile };
      }

      await user.save();
      const updatedObj = user.toObject();
      delete updatedObj.password;

      return res.status(200).json({ message: 'Profile updated successfully.', user: updatedObj });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
