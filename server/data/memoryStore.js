// In-Memory Database for Milestone 2
const bcrypt = require('bcryptjs');

const db = {
  users: [
    {
      id: "user1",
      name: "Danindu",
      email: "danindu@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Full Stack Developer",
      bio: "Building seamless collaborative experiences",
      avatar: "DA"
    },
    {
      id: "user2",
      name: "Uditha",
      email: "uditha@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Frontend Developer",
      bio: "UI/UX passionate developer",
      avatar: "UD"
    },
    {
      id: "user3",
      name: "Anupa",
      email: "anupa@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "QA Engineer",
      bio: "Quality assurance specialist",
      avatar: "AN"
    },
    {
      id: "user4",
      name: "Induwara",
      email: "induwara@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "UI Designer",
      bio: "Creative UI/UX designer",
      avatar: "IN"
    },
    {
      id: "user5",
      name: "Udan",
      email: "udan@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Backend Developer",
      bio: "API and database expert",
      avatar: "UD"
    },
    {
      id: "user6",
      name: "Nethupa",
      email: "nethupa@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Full Stack Developer",
      bio: "Dashboard specialist",
      avatar: "NE"
    },
    {
      id: "user7",
      name: "Hansana",
      email: "hansana@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Senior Backend Developer",
      bio: "Backend architecture expert",
      avatar: "HA"
    },
    {
      id: "user8",
      name: "Chanara",
      email: "chanara@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Backend Developer",
      bio: "API testing and routing",
      avatar: "CH"
    },
    {
      id: "user9",
      name: "Oshada",
      email: "oshada@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "Frontend Developer",
      bio: "React component specialist",
      avatar: "OS"
    },
    {
      id: "user10",
      name: "Vihas",
      email: "vihas@example.com",
      password: bcrypt.hashSync("password123", 10),
      jobTitle: "UI Developer",
      bio: "UI consistency expert",
      avatar: "VI"
    }
  ],
  teams: [
    {
      id: "teamA",
      name: "Frontend Squadron",
      description: "Core frontend development team",
      members: [
        { userId: "user1", role: "admin" },
        { userId: "user2", role: "member" },
        { userId: "user9", role: "member" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "teamB",
      name: "Backend Brigade",
      description: "Backend API and database team",
      members: [
        { userId: "user7", role: "admin" },
        { userId: "user5", role: "member" },
        { userId: "user8", role: "member" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "teamC",
      name: "Design & QA Team",
      description: "UI/UX design and quality assurance",
      members: [
        { userId: "user4", role: "admin" },
        { userId: "user3", role: "member" },
        { userId: "user10", role: "member" }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  boards: [
    {
      id: "board1",
      title: "SyncBoard - Frontend Development",
      description: "All frontend tasks for SyncBoard project",
      teamId: "teamA",
      createdBy: "user1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "board2",
      title: "SyncBoard - Backend APIs",
      description: "REST API development and testing",
      teamId: "teamB",
      createdBy: "user7",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "board3",
      title: "UI/UX Design Sprint",
      description: "Design and branding tasks",
      teamId: "teamC",
      createdBy: "user4",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  columns: [
    {
      id: "col1",
      boardId: "board1",
      title: "To Do",
      position: 0
    },
    {
      id: "col2",
      boardId: "board1",
      title: "In Progress",
      position: 1
    },
    {
      id: "col3",
      boardId: "board1",
      title: "Review",
      position: 2
    },
    {
      id: "col4",
      boardId: "board1",
      title: "Done",
      position: 3
    }
  ],
  tasks: [
    {
      id: "task1",
      boardId: "board1",
      columnId: "col1",
      title: "Setup React routing",
      description: "Configure React Router for all pages",
      assignee: "user1",
      priority: "High",
      dueDate: "2026-09-05T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task2",
      boardId: "board1",
      columnId: "col2",
      title: "Design login page UI",
      description: "Create responsive login page with validation",
      assignee: "user2",
      priority: "High",
      dueDate: "2026-09-03T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task3",
      boardId: "board1",
      columnId: "col2",
      title: "Implement board component",
      description: "Create Kanban board with drag-drop functionality",
      assignee: "user9",
      priority: "High",
      dueDate: "2026-09-07T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task4",
      boardId: "board1",
      columnId: "col3",
      title: "Integrate Axios API client",
      description: "Setup API communication layer with interceptors",
      assignee: "user1",
      priority: "Medium",
      dueDate: "2026-09-02T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task5",
      boardId: "board1",
      columnId: "col4",
      title: "Create responsive layout",
      description: "Build mobile-friendly dashboard layout",
      assignee: "user2",
      priority: "Medium",
      dueDate: "2026-08-28T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task6",
      boardId: "board2",
      columnId: "col1",
      title: "Implement auth routes",
      description: "Create login and registration endpoints",
      assignee: "user7",
      priority: "High",
      dueDate: "2026-09-01T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task7",
      boardId: "board2",
      columnId: "col2",
      title: "Setup MongoDB connection",
      description: "Configure Mongoose and database schema",
      assignee: "user5",
      priority: "High",
      dueDate: "2026-09-04T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    },
    {
      id: "task8",
      boardId: "board2",
      columnId: "col3",
      title: "Create board endpoints",
      description: "Implement CRUD operations for boards",
      assignee: "user8",
      priority: "Medium",
      dueDate: "2026-09-06T00:00:00Z",
      createdAt: new Date().toISOString(),
      comments: []
    }
  ],
  activities: [
    {
      id: "act1",
      userId: "user1",
      userName: "Danindu",
      boardId: "board1",
      action: "created task 'Setup React routing'",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "act2",
      userId: "user2",
      userName: "Uditha",
      boardId: "board1",
      action: "moved task 'Design login page UI' to In Progress",
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "act3",
      userId: "user9",
      userName: "Oshada",
      boardId: "board1",
      action: "assigned 'Implement board component' to themselves",
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "act4",
      userId: "user7",
      userName: "Hansana",
      boardId: "board2",
      action: "created task 'Implement auth routes'",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "act5",
      userId: "user5",
      userName: "Udan",
      boardId: "board2",
      action: "completed task 'Setup MongoDB connection'",
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: "act6",
      userId: "user1",
      userName: "Danindu",
      boardId: "board1",
      action: "commented on 'Integrate Axios API client': Looking good!",
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif1",
      userId: "user1",
      type: "assignment",
      message: "You were assigned to 'Setup React routing'",
      boardId: "board1",
      taskId: "task1",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "notif2",
      userId: "user2",
      type: "comment",
      message: "Danindu commented on 'Design login page UI'",
      boardId: "board1",
      taskId: "task2",
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "notif3",
      userId: "user9",
      type: "mention",
      message: "Danindu mentioned you in 'Implement board component'",
      boardId: "board1",
      taskId: "task3",
      read: true,
      createdAt: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "notif4",
      userId: "user7",
      type: "task_due",
      message: "Task 'Implement auth routes' is due soon",
      boardId: "board2",
      taskId: "task6",
      read: false,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: "notif5",
      userId: "user1",
      type: "team_update",
      message: "Uditha joined Frontend Squadron",
      boardId: "board1",
      read: true,
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ]
};

module.exports = db;
