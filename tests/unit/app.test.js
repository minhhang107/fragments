// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 handler middleware', () => {
  // If the resource requested is not found, it should return error
  test('should return error for resources that cant be found', async () => {
    const res = await request(app).get('/not-found');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
  });
});
