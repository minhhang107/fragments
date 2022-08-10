const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test(`invalid id returns error`, async () => {
    const res = await request(app)
      .put(`/v1/fragments/invalid`)
      .send('this is a fragment')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test(`fragment's data type can't be changed after it's created`, async () => {
    const data = 'original fragment';
    const newData = 'updated fragment';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const putResponse = await request(app)
      .put(`/v1/fragments/${postResponse.body.fragment.id}`)
      .send(newData)
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1');

    expect(putResponse.statusCode).toBe(400);
    expect(putResponse.body.status).toBe('error');
    expect(putResponse.body.error.message).toBe(
      'A fragment’s type can not be changed after it is created.'
    );
  });

  test(`authenticated users can update an existing fragment's data`, async () => {
    const data = 'original fragment';
    const newData = 'updated fragment';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const putResponse = await request(app)
      .put(`/v1/fragments/${postResponse.body.fragment.id}`)
      .send(newData)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(putResponse.statusCode).toBe(200);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.text).toBe(newData);
  });
});
