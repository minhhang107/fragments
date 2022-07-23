const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const id = postResponse.body.fragment.id;
    await request(app).delete(`/v1/fragments/${id}`).expect(401);
  });

  test('incorrect credentials are denied', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const id = postResponse.body.fragment.id;
    await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('invalid@email.com', 'password')
      .expect(401);
  });

  test('invalid fragment id returns error', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/not-exist`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test('valid fragment is deleted', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const id = postResponse.body.fragment.id;
    const delResponse = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(delResponse.statusCode).toBe(200);
    expect(delResponse.body.status).toBe('ok');
  });
});
