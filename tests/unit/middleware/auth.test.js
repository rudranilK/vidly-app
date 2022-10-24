const { User } = require('../../../models/user');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware', () => {
   it('should populate req.user with the payload of a valid JWT', () => {
      const user = {
         _id: mongoose.Types.ObjectId(), //.toHexString()
         isAdmin: true
      };

      const token = new User(user).generateAuthToken();

      const req = {
         header: jest.fn().mockReturnValue(token)
      };

      const res = {
         // status: jest.fn(),
         // send: jest.fn()
      };

      const next = jest.fn();

      //Function call
      auth(req, res, next);

      // expect(req).toBeDefined(); --> Too Generic
      expect(req).toHaveProperty('user');

      // expect(req.user).toHaveProperty('_id');
      // expect(req.user).toHaveProperty('isAdmin', user.isAdmin);

      expect(req.user).toMatchObject(user);
      expect(next).toHaveBeenCalled();
   });
});