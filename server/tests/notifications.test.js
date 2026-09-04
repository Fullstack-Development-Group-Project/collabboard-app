const request = require('supertest');
const app = require('../server');
const Notification = require('../models/Notification');

describe('Notifications Controller Integration Tests', () => {
  let token;
  let user;

  beforeEach(async () => {
    const resAuth = await request(app).post('/api/v1/auth/register').send({
      name: 'Notification User',
      email: 'notification@example.com',
      password: 'password123'
    });
    token = resAuth.body.token;
    user = resAuth.body.user;

    // Seed a notification manually
    await Notification.create({
      userId: user.id,
      type: 'system',
      message: 'Test notification',
      read: false
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should fetch all notifications for the user', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].message).toBe('Test notification');
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const getRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      const notifId = getRes.body[0].id;

      const res = await request(app)
        .put(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.read).toBe(true);
    });
  });
});
