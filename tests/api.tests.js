'use strict';
const fs = require('fs');
const {assert} = require('chai');
const request = require('supertest');

const HOST = 'http://localhost:3000';
const STORAGE = '../data.storage';

const cleanStorage = () => {
  return fs.writeFileSync(`${__dirname}/${STORAGE}`, '')
};

describe('Service api', () => {
  before(() => cleanStorage());
  afterEach(() => cleanStorage());

  describe('/users', () => {
    describe('GET', () => {
      it('will return positive result with status code: 200', async () => {
        const {body, statusCode} = await request(HOST).get('/users');

        assert.equal(statusCode, 200);
        assert.equal(body.toString(), '[]');
      });
    });

    describe('POST', () => {
      it('will return negative result with status code: 400', async () => {
        const {statusCode} = await request(HOST)
          .post('/users')
          .send({});

        assert.equal(statusCode, 400);
      });

      it('will return positive result with status code: 201', async () => {
        const {statusCode} = await request(HOST)
          .post('/users')
          .send({
            username: 'test',
            email: 'test@gmail.com',
            password: 'password'
          });

        assert.equal(statusCode, 201);
      });

      it('will return negative result with status code: 409', async () => {
        const mock = {
          username: 'test',
          email: 'test@gmail.com',
          password: 'password'
        };

        await request(HOST).post('/users').send(mock);

        const {statusCode} = await request(HOST).post('/users').send(mock);

        assert.equal(statusCode, 409);
      });
    });
  });

  describe('/users/1', () => {
    beforeEach(() => {
      const mock = {
        username: 'test',
        email: 'test@gmail.com',
        password: 'password'
      };

      return request(HOST).post('/users').send(mock);
    });

    describe('GET', () => {
      it('will return positive result with status code: 200', async () => {
        const {body, statusCode} = await request(HOST).get('/users/1');
        const mock = {
        username: 'test',
        email: 'test@gmail.com',
        password: 'password'
      };

        assert.equal(statusCode, 200);
        assert.equal(body.username, mock.username);
        assert.equal(body.email, mock.email);
      });
    });

    describe('PUT', () => {
      it('will return positive result with status code: 200', async () => {
        const mock = {
          username: 'test1',
          email: 'test1@gmail.com',
          password: 'password1'
        };

        const {body, statusCode} = await request(HOST)
          .put('/users/1')
          .send(mock);

        assert.equal(statusCode, 200);
        assert.equal(body.username, mock.username);
        assert.equal(body.email, mock.email);
      });
    });

    describe('DELETE', () => {
      it('will return positive result with status code: 200', async () => {
        const {body, statusCode} = await request(HOST)
          .delete('/users/1');

        assert.equal(statusCode, 200);
        assert.equal(body.message, 'User has been successfully removed.');
      });
    });
  });
});
