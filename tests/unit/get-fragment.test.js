const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test(`invalid id returns error`, async () => {
    const res = await request(app)
      .get(`/v1/fragments/invalid`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test(`authenticated users can get an existing fragment's data`, async () => {
    const data = 'this is a fragment';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    console.log(getResponse.body);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toBe(data);
  });
});
