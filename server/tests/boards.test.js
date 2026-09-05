const request = require('supertest');
const app = require('../server');

describe('Boards Controller Integration Tests', () => {
  let token;
  let boardId;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Board Creator',
      email: 'creator@example.com',
      password: 'password123'
    });
    token = res.body.token;
  });

  describe('POST /api/v1/boards', () => {
    it('should create a new board and cascade default columns', async () => {
      const res = await request(app)
        .post('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My New Board', description: 'Testing' });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('My New Board');
      expect(res.body.columns.length).toBe(3); // To Do, In Progress, Done
      
      boardId = res.body.id;
    });

    it('should fail without a title', async () => {
      const res = await request(app)
        .post('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Testing' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/boards', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My New Board' });
    });

    it('should return boards for the user', async () => {
      const res = await request(app)
        .get('/api/v1/boards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
