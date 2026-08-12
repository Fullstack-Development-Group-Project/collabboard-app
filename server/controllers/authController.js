const db = require('../data/memoryStore');

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: "user" + Date.now(),
    name,
    email,
    password // Normally hashed
  };
  db.users.push(newUser);

  res.status(201).json({
    token: "mock_jwt_token_for_" + newUser.id,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.status(200).json({
    token: "mock_jwt_token_for_" + user.id,
    user: { id: user.id, name: user.name, email: user.email }
  });
};
