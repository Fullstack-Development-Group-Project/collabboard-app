// In-Memory Database for Milestone 2
const bcrypt = require('bcryptjs');

const db = {
  users: [
    {
      id: "user123",
      name: "Danindu",
      email: "danindu@example.com",
      password: bcrypt.hashSync("securepassword123", 10),
      jobTitle: "Software Developer",
      bio: "Building seamless collaborative experiences"
    }
  ],
  teams: [
    {
      id: "team123",
      name: "Engineering Squad",
      description: "Core dev team",
      members: [
        { userId: "user123", role: "admin" }
      ]
    }
  ],
  boards: [
    {
      id: "board1",
      title: "CollabBoard App",
      teamId: "team123",
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: "task1",
      title: "Design Wireframes",
      description: "Create UI wireframes for M1",
      priority: "High",
      columnId: "col1",
      boardId: "board1",
      assignee: "user123",
      status: "Doing",
      dueDate: "2026-08-15T00:00:00Z"
    }
  ],
  activities: [
    {
      id: "act1",
      userId: "user123",
      userName: "Danindu",
      boardId: "board1",
      action: "moved task 'Design Wireframes' to Doing",
      timestamp: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "notif1",
      userId: "user123",
      type: "assignment",
      message: "You were assigned to 'Setup Express'",
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
};

module.exports = db;
