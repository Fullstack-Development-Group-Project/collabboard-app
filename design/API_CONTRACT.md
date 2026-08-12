# CollabBoard API Contract

**Base URL:** `/api/v1`

## Authentication

### 1. Register User
- **Endpoint:** `POST /auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "Danindu",
    "email": "danindu@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { "id": "user123", "name": "Danindu", "email": "danindu@example.com" }
  }
  ```

### 2. Login User
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticates user and returns JWT.
- **Request Body:**
  ```json
  {
    "email": "danindu@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { "id": "user123", "name": "Danindu", "email": "danindu@example.com" }
  }
  ```

## Boards

*(Note: All routes below require a valid JWT passed in the `Authorization: Bearer <token>` header)*

### 1. Get All User's Boards (Personal & Team)
- **Endpoint:** `GET /boards`
- **Description:** Fetches all boards accessible by the authenticated user (both personal boards and boards belonging to their teams).
- **Response (200 OK):**
  ```json
  [
    {
      "id": "board1",
      "title": "CollabBoard App",
      "teamId": "team123", // Null if personal board
      "createdAt": "2026-08-12T00:00:00Z"
    }
  ]
  ```

### 2. Create a Board
- **Endpoint:** `POST /boards`
- **Description:** Creates a new board. Can be personal or assigned to a team.
- **Request Body:**
  ```json
  {
    "title": "Marketing Sprint",
    "teamId": "team123" // Optional. If omitted, board is personal.
  }
  ```
- **Response (201 Created):** Returns the newly created board object.

### 2. Get Single Board (With Tasks)
- **Endpoint:** `GET /boards/:id`
- **Description:** Fetches a single board and all its columns/tasks.
- **Response (200 OK):**
  ```json
  {
    "id": "board1",
    "title": "CollabBoard App",
    "columns": [
      {
        "id": "col1",
        "title": "To Do",
        "tasks": [
          {
            "id": "task1",
            "title": "Design Wireframes",
            "description": "Create UI wireframes for M1",
            "priority": "High",
            "assignee": "Danindu"
          }
        ]
      }
    ]
  }
  ```

## Tasks

### 1. Create a Task
- **Endpoint:** `POST /boards/:boardId/tasks`
- **Description:** Adds a new task to a specific board.
- **Request Body:**
  ```json
  {
    "title": "Setup Express",
    "description": "Initialize Node.js server",
    "priority": "Medium",
    "columnId": "col1",
    "assignee": "Uditha"
  }
  ```
- **Response (201 Created):** Returns the newly created task object.

### 2. Update a Task
- **Endpoint:** `PUT /tasks/:id`
- **Description:** Updates a task's details (like moving it to "Doing").
- **Request Body:**
  ```json
  {
    "columnId": "col2"
  }
  ```
- **Response (200 OK):** Returns the updated task object.

### 3. Delete a Task
- **Endpoint:** `DELETE /tasks/:id`
- **Description:** Removes a task from the board.
- **Response (204 No Content)**

## User Profile

### 1. Get User Profile
- **Endpoint:** `GET /users/me`
- **Description:** Retrieves the profile of the currently authenticated user.
- **Response (200 OK):** Returns the user object (id, name, email, job title, bio).

### 2. Update User Profile
- **Endpoint:** `PUT /users/me`
- **Description:** Updates the authenticated user's profile information.
- **Request Body:**
  ```json
  {
    "name": "Danindu",
    "jobTitle": "Software Developer",
    "bio": "Building seamless collaborative experiences"
  }
  ```
- **Response (200 OK):** Returns the updated user object.

## Teams (Shared Workspaces)

### 1. Create a Team
- **Endpoint:** `POST /teams`
- **Description:** Creates a new team. The user creating it is automatically assigned the 'Admin' role.
- **Request Body:**
  ```json
  {
    "name": "Engineering Squad",
    "description": "Core dev team"
  }
  ```
- **Response (201 Created):** Returns the newly created team object.

### 2. Get User's Teams
- **Endpoint:** `GET /teams`
- **Description:** Fetches all teams the authenticated user belongs to.
- **Response (200 OK):** Array of team objects.

### 3. Get Team's Shared Boards
- **Endpoint:** `GET /teams/:id/boards`
- **Description:** Fetches all shared boards that belong exclusively to this specific team.
- **Response (200 OK):** Array of board objects.

### 4. Get Single Team Details
- **Endpoint:** `GET /teams/:id`
- **Description:** Fetches details of a specific team, including members and their roles (Admin vs Member).
- **Response (200 OK):** Team object with members array.

### 5. Update Team (Admin Only)
- **Endpoint:** `PUT /teams/:id`
- **Description:** Updates team details (name, description).
- **Response (200 OK):** Updated team object.

### 6. Delete Team (Admin Only)
- **Endpoint:** `DELETE /teams/:id`
- **Description:** Permanently deletes the team and all associated shared boards.
- **Response (204 No Content)**

## Team Memberships

### 1. Invite User to Team (Admin Only)
- **Endpoint:** `POST /teams/:id/invitations`
- **Description:** Sends an invitation to a user by email to join the team.
- **Request Body:**
  ```json
  {
    "email": "teammate@example.com"
  }
  ```
- **Response (201 Created):** Invitation sent successfully.

### 2. Accept Team Invitation
- **Endpoint:** `POST /teams/invitations/:invitationId/accept`
- **Description:** User accepts a pending invitation to join a team.
- **Response (200 OK):** User is added as a 'Member' to the team.

### 3. Leave Team
- **Endpoint:** `DELETE /teams/:id/members/me`
- **Description:** The authenticated user leaves the specified team.
- **Response (204 No Content)**

### 4. Remove Member / Change Role (Admin Only)
- **Endpoint:** `PUT /teams/:id/members/:userId`
- **Description:** Admin removes a member or updates their role (e.g., promote to Admin).
- **Request Body:**
  ```json
  {
    "action": "remove" // or { "role": "admin" }
  }
  ```
- **Response (200 OK):** Member updated/removed successfully.
