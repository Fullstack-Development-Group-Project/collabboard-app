const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Users Controller Integration Tests', () => {
  let token;
  let user;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    token = res.body.token;
    user = await User.findById(res.body.user.id);
  });

  describe('GET /api/v1/users/me', () => {
    it('should fetch the authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update allowed profile fields', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', bio: 'Hello World' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.bio).toBe('Hello World');
    });

    it('SECURITY: should prevent password mass assignment', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'hackedpassword' });

      expect(res.statusCode).toBe(200);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.password).toBe(user.password); // Password hash must not change
    });
  });
});
