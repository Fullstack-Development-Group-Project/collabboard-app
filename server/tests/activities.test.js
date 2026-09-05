const request = require('supertest');
const app = require('../server');

describe('Activities Controller Integration Tests', () => {
  let token;
  let boardId;

  beforeEach(async () => {
    const resAuth = await request(app).post('/api/v1/auth/register').send({
      name: 'Activity User',
      email: 'activity@example.com',
      password: 'password123'
    });
    token = resAuth.body.token;

    const resBoard = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Activity Test Board' });
    boardId = resBoard.body.id;
  });

  describe('GET /api/v1/boards/:boardId/activities', () => {
    it('should return activities for a board', async () => {
      // Creating a board automatically creates an activity via Board model hook or controller logic
      // In this app, activity is created when a task is created or updated.
      // Let's create a task to trigger an activity.
      const columnId = (await request(app).get('/api/v1/boards').set('Authorization', `Bearer ${token}`)).body[0].columns[0];
      
      await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task For Activity', columnId });

      const res = await request(app)
        .get(`/api/v1/boards/${boardId}/activities`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('action');
    });
  });
});
