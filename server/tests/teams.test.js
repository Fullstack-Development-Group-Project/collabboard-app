const request = require('supertest');
const app = require('../server');
const Team = require('../models/Team');

describe('Teams Controller Integration Tests', () => {
  let adminToken;
  let adminUser;
  let teamId;

  beforeEach(async () => {
    const resAuth = await request(app).post('/api/v1/auth/register').send({
      name: 'Team Admin',
      email: 'admin@example.com',
      password: 'password123'
    });
    adminToken = resAuth.body.token;
    adminUser = resAuth.body.user;
  });

  describe('POST /api/v1/teams', () => {
    it('should create a new team with creator as admin', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Alpha Team', description: 'Test Team' });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Alpha Team');
      expect(res.body.members[0].userId.toString()).toBe(adminUser.id.toString());
      expect(res.body.members[0].role).toBe('admin');

      teamId = res.body.id;
    });
  });

  describe('PUT /api/v1/teams/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Alpha Team' });
      teamId = res.body.id;
    });

    it('should allow admin to update name and description', async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Beta Team' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Beta Team');
    });

    it('SECURITY: should prevent createdBy mass assignment', async () => {
      const res = await request(app)
        .put(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ createdBy: 'malicious-user-id' });

      expect(res.statusCode).toBe(200);
      
      const team = await Team.findById(teamId);
      expect(team.createdBy.toString()).toBe(adminUser.id.toString());
    });
  });
});
