const request = require('supertest');

const app = require('../../src/app');
const { readFragment } = require('../../src/model/data');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users post a supported fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('authenticated users post an unsupported fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/html')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('responses include all necessary and expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    const fragment = await readFragment(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.body.fragment).toEqual(fragment);
  });

  test('responses include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.header.location).toContain(`/v1/fragments/${res.body.fragment.id}`);
  });
});
