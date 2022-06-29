// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');
const { readFragment } = require('../../src/model/data');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // Without expand, query should return only id
  test('without expand, authenticated users get an array of fragment ids', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const fragment = await readFragment(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(typeof res.body.fragments[0]).toBe('string');
    expect(res.body.fragments[0]).toBe(fragment.id);
  });

  // With expand, query should return metadata
  test('with expand, authenticated users get an array of fragment metadata', async () => {
    await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(typeof res.body.fragments[0]).toBe('object');
  });
});

describe('GET /v1/fragments/id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

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
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.text).toBe(data);
  });

  test(`markdown can be converted into html`, async () => {
    const data = 'this is a markdown';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1');

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.text).toBe(`<p>${data}</p>\n`);
  });

  test(`text type can't be converted into image`, async () => {
    const data = 'this is a text';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .send(data)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.jpeg`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(415);
    expect(getResponse.body.error.message).toBe('Unsupported conversion type!');
  });
});

describe('GET /v1/fragments/id/info', () => {
  test(`invalid id returns error`, async () => {
    const res = await request(app)
      .get(`/v1/fragments/invalid/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test(`authenticated users can get an existing fragment's metadata`, async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .send('this is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');

    const fragment = await readFragment(
      postResponse.body.fragment.ownerId,
      postResponse.body.fragment.id
    );

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toEqual(fragment);
  });
});
