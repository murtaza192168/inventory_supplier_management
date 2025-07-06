const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ companyName, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        businessName: user.companyName,
        token: generateToken(user),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        token: generateToken(user),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
