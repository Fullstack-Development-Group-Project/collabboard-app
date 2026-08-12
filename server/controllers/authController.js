const db = require('../data/memoryStore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = {
    id: "user" + Date.now(),
    name,
    email,
    password: hashedPassword
  };
  db.users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Verify password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
};
