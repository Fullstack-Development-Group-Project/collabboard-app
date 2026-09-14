require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Board = require('./models/Board');
const Task = require('./models/Task');
const Column = require('./models/Column');
const Team = require('./models/Team');
const Activity = require('./models/Activity');
const Notification = require('./models/Notification');
const dbData = require('./data/memoryStore');

const seedDb = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Board.deleteMany({}),
      Task.deleteMany({}),
      Column.deleteMany({}),
      Team.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('Cleared.');

    console.log('Inserting seed data...');
    // Replace ids with _id to match MongoDB expectations if necessary,
    // actually Mongoose handles string _id casting if we specify _id manually,
    // or we can just let it generate ObjectIds and rewrite the relations.
    // Wait, memoryStore uses string IDs like "user1", "board1", "col1", "task1".
    // Mongoose ObjectIds MUST be 24 char hex strings.
    // So we need to map string IDs to proper ObjectIds.
    
    const idMap = {};
    const getObjectId = (oldId) => {
      if (!oldId) return null;
      if (!idMap[oldId]) {
        idMap[oldId] = new mongoose.Types.ObjectId();
      }
      return idMap[oldId];
    };

    const users = dbData.users.map(u => ({
      _id: getObjectId(u.id),
      name: u.name,
      email: u.email,
      password: u.password,
      jobTitle: u.jobTitle,
      bio: u.bio,
      avatar: u.avatar
    }));

    const teams = dbData.teams.map(t => ({
      _id: getObjectId(t.id),
      name: t.name,
      description: t.description,
      members: t.members.map(m => ({
        userId: getObjectId(m.userId),
        role: m.role
      })),
      createdAt: t.createdAt
    }));

    const boards = dbData.boards.map(b => ({
      _id: getObjectId(b.id),
      title: b.title,
      description: b.description,
      teamId: getObjectId(b.teamId),
      createdBy: getObjectId(b.createdBy),
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));

    const columns = dbData.columns.map(c => ({
      _id: getObjectId(c.id),
      boardId: getObjectId(c.boardId),
      title: c.title,
      position: c.position
    }));

    const tasks = dbData.tasks.map(t => ({
      _id: getObjectId(t.id),
      boardId: getObjectId(t.boardId),
      columnId: getObjectId(t.columnId),
      title: t.title,
      description: t.description,
      assignee: getObjectId(t.assignee),
      priority: t.priority,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      comments: []
    }));

    await User.insertMany(users);
    await Team.insertMany(teams);
    await Board.insertMany(boards);
    await Column.insertMany(columns);
    await Task.insertMany(tasks);
    
    // Create an actual user account we know the password to (if we want to test)
    // The users all have 'password123' hashed with bcrypt in memoryStore, so they will work!
    
    console.log('Seed complete!');
    console.log('Test Users:');
    console.log('danindu@example.com / password123');
    console.log('uditha@example.com / password123');
    console.log('induwara@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDb();
