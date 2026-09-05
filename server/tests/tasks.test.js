const request = require('supertest');
const app = require('../server');

describe('Tasks Controller Integration Tests', () => {
  let token;
  let boardId;
  let columnId;
  let taskId;

  beforeEach(async () => {
    // 1. Setup User
    const resAuth = await request(app).post('/api/v1/auth/register').send({
      name: 'Task User',
      email: 'task@example.com',
      password: 'password123'
    });
    token = resAuth.body.token;

    // 2. Setup Board & Columns
    const resBoard = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task Test Board' });
    
    boardId = resBoard.body.id;
    columnId = resBoard.body.columns[0]._id; // "To Do" column
  });

  describe('POST /api/v1/boards/:boardId/tasks', () => {
    it('should create a task in a specific column', async () => {
      const res = await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Task',
          columnId,
          priority: 'High'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('New Task');
      expect(res.body.boardId.toString()).toBe(boardId.toString());
      
      taskId = res.body.id;
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task To Update', columnId });
      taskId = res.body.id;
    });

    it('should update task details successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Task Name');
    });

    it('SECURITY: should prevent boardId mass assignment', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ boardId: 'some-malicious-board-id' });

      expect(res.statusCode).toBe(200);
      expect(res.body.boardId.toString()).toBe(boardId.toString()); // Ensure it did not change
    });
  });
});
