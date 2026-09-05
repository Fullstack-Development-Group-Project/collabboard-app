const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const db = require('../data/memoryStore'); // So we can mock/reset memoryStore if needed

let mongoServer;

beforeAll(async () => {
  // Start the MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set the environment variable so db.js connects to this instead
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test_secret';
  
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  // Clear real database collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  // Clear memory store so tests don't pollute each other
  db.boards = [];
  db.columns = [];
  db.tasks = [];
  db.users = [];
  db.activities = [];
  db.teams = [];
});
