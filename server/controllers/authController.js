const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    if (!name || !trimmedEmail || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
