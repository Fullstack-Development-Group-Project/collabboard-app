# SyncBoard

SyncBoard is a collaborative Kanban-style project management app designed for team planning, task tracking, and progress visibility. The project combines a React frontend with a Node.js/Express backend and supports a board-based workflow with authentication, teams, tasks, activity, and notifications.

## Project Overview

- Frontend: React + Vite
- Backend: Node.js + Express
- Data Access: MongoDB with Mongoose (project-ready schema layer)
- Features:
  - User registration and login
  - Board, column, and task management
  - Team membership views
  - Assigned tasks dashboard
  - Activity feed and recent boards
  - JWT-based protected routes
  - Offline mode fallback for board data

## Team Structure

### Subgroup A
- Danindu — Subgroup Leader, frontend/backend integration, project coordination
- Uditha — UI and API flow support
- Anupa — feature support and documentation

### Subgroup B
- Induwara — Subgroup Leader, UI and flow validation
- Udan — task and board feature support
- Nethupa — dashboard and page content support

### Subgroup C
- Hansana — Subgroup Leader, backend support and ownership
- Chanara — backend and route testing support
- Oshada — frontend/page implementation support
- Vihas — UI consistency and quality support

### Code Owners
- Danindu
- Hansana

## GitHub Repository

Repository:
https://github.com/Fullstack-Development-Group-Project/collabboard-app

Git tag created for this assignment:
Assignment-02-Working-REST-APIs-with-mock-data-Integrated-with-Frontend

## Assignment Tag

```bash
git tag -a Assignment-02-Working-REST-APIs-with-mock-data-Integrated-with-Frontend -m "Assignment 02 - Working REST APIs (with mock data) Integrated with Frontend"
```

To push the tag to GitHub:

```bash
git push origin Assignment-02-Working-REST-APIs-with-mock-data-Integrated-with-Frontend
```

## Local Setup

### Prerequisites
- Node.js 16+ and npm installed
- Git installed

### 1. Clone the repository
```bash
git clone https://github.com/Fullstack-Development-Group-Project/collabboard-app.git
cd collabboard-app
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd server
npm install
cd ..
```

### 4. Environment Configuration

#### Frontend (.env in root)
The project root already has a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

#### Backend (.env in server/)
The `server/.env` file is already configured:
```env
JWT_SECRET=your_super_secret_jwt_key_2026
PORT=5000
MONGODB_URI=
VITE_API_URL=http://localhost:5000/api/v1
NODE_ENV=development
```

**Note:** MONGODB_URI is optional. Without it, the backend uses in-memory mock data from `server/data/memoryStore.js`.

### 5. Running the Application

#### Option A: Using Terminal (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
Expected output:
```
CollabBoard API is running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Expected output:
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### Option B: Using npm scripts (if available)
```bash
npm run dev:all
```

### 6. Access the Application

Open in browser:
```
http://localhost:5173
```

**Test Login Credentials:**
- Email: `danindu@example.com`
- Password: `password123`

Or any user from the mock data with password `password123`

### 7. Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:** (already production-ready)
```bash
cd server
npm start
```

## API Collection

A Postman collection is included in the repository at:
- `postman/SyncBoard.postman_collection.json`

### Importing into Postman:
1. Open Postman
2. Click "Import" button
3. Select `postman/SyncBoard.postman_collection.json`
4. All API endpoints will be ready to test

### Base URL
```
http://localhost:5000/api/v1
```

### Available Endpoints:
- **Authentication:** Login, Register, Logout
- **Users:** CRUD operations on user profiles
- **Teams:** Team management and member operations
- **Boards:** Create, read, update, delete boards
- **Columns:** Column management within boards
- **Tasks:** Task CRUD with assignment and status
- **Activities:** Activity log tracking
- **Notifications:** User notifications management

### Quick API Test:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "CollabBoard API is running"
}
```

## Mock Data

The application includes comprehensive mock data for testing:

### Users (10 total)
- Danindu, Uditha, Anupa, Induwara, Udan, Nethupa, Hansana, Chanara, Oshada, Vihas

### Teams (3 total)
- Frontend Squadron
- Backend Brigade
- Design & QA Team

### Boards (3 total)
- SyncBoard - Frontend Development
- SyncBoard - Backend APIs
- UI/UX Design Sprint

### Task Details
- 8 sample tasks across different columns
- Various priorities (High, Medium)
- Assigned to different team members
- Multiple statuses (To Do, In Progress, Review, Done)

**Default Login:**
- Email: `danindu@example.com`
- Password: `password123`

All other mock users use the same password for testing.

## Documentation and Design

- API contract: `design/API_CONTRACT.md`
- React architecture diagram: `design/architecture/CollabBoard - React Tree Architecture.drawio`
- Wireframes: `design/Wireframes/`

## Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "CollabBoard API is running"
}
```

## Notes

This project is structured as a full-stack collaboration tool demonstration. It is suitable for academic submission and for deployment to a shared development environment with a MongoDB Atlas or local MongoDB instance.

