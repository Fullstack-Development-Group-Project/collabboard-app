const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../data/memoryStore');
const { JWT_SECRET } = require('../config/jwtConfig');

// Helper function to find user in memory store
const findUserInMemory = (email) => {
  const trimmedEmail = email?.trim().toLowerCase();
  return db.users.find(u => u.email.toLowerCase() === trimmedEmail);
};

// Helper function to find user from database
const findUserInDB = async (email) => {
  try {
    const trimmedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });
    return user;
  } catch (error) {
    console.log('Database query failed, falling back to memory store');
    return null;
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    if (!name || !trimmedEmail || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check memory store first
    let existingUser = findUserInMemory(trimmedEmail);
    
    // If not in memory, check database
    if (!existingUser) {
      existingUser = await findUserInDB(trimmedEmail);
    }

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Try to create in database
    try {
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

      return res.status(201).json({
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (dbError) {
      // If database fails, create in memory store
      const newId = `user${db.users.length + 1}`;
      const newUser = {
        id: newId,
        name: name.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        jobTitle: '',
        bio: '',
        avatar: name.substring(0, 2).toUpperCase(),
      };
      
      db.users.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, name: newUser.name, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '24h' },
      );

      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    // First check memory store
    let user = findUserInMemory(trimmedEmail);

    // If not in memory, try database
    if (!user) {
      user = await findUserInDB(trimmedEmail);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id || user._id?.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.status(200).json({
      token,
      user: {
        id: user.id || user._id?.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
