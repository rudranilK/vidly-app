const request = require('supertest');
const { User } = require('../../models/user');

describe('auth middleware', () => {

   let token;

   beforeEach(() => {
      server = require('../../index');
      token = new User().generateAuthToken();
   });

   afterEach(async () => { await server.close(); });

   //Happy path 
   const exec = () => {
      return request(server)
         .get('/vidly.com/api/users/me')
         .set('x-auth-token', token);
   };

   it('should return 401 if no token is provided', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
   });

   it('should return 400 if invalid token is provided', async () => {
      token = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
   });

   it('should return 200 if correct token is provided', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      //We can check for a specific user, for that we'll have to create a user, save it in DB and use it's token to retrive it's details frm the api -> but that would be consided as integration testing for that route and not the middleware only. 

      //Here just testing the middleware's execution paths
   });
});