const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const objectID = require('mongoose').Types.ObjectId();

let server;

describe('/vidly.com/api/genres', () => {

   beforeEach(() => { server = require('../../index'); });
   afterEach(async () => {
      await Genre.remove({});
      await server.close();
   });

   describe('GET /', () => {
      it('should return all genres', async () => {
         await Genre.collection.insertMany([
            { name: 'genre1' },
            { name: 'genre2' }
         ]);

         const res = await request(server).get('/vidly.com/api/genres');

         expect(res.status).toBe(200);
         expect(res.body.length).toBe(2);
         expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
         expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
      });
   });

   describe('GET /:id', () => {
      it('should return the genre passed if it is a valid id', async () => {

         const genre = new Genre({ name: 'genre1' });
         await genre.save();

         const res = await request(server).get(`/vidly.com/api/genres/${genre._id}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('name', genre.name);
         // expect(res.body).toMatchObject(genre); // this fails due to the additional property '__v'

         /* COMMENT
         //Approach no : 2 -> this was done using name as the req.param
         //In the service layer we used await Genre.find() which returns an array ->

         // await Genre.collection.insertOne({ name: 'GENRE1' }); // The route makes it uppercase
         // const res = await request(server).get(`/vidly.com/api/genres/genre1`);
         // expect(res.status).toBe(200);
         // expect(res.body.length).toBe(1);
         // expect(res.body[0]).toHaveProperty('name', 'GENRE1'); 
         */
      });

      it('should return 404 if invalid ID is passed', async () => {
         const res = await request(server).get('/vidly.com/api/genres/1'); //or, pass genre1 for 'name'
         expect(res.status).toBe(404);
         // expect(res.body).toMatch(/not found/);
      });

      it('should return 404 if no genre with the given ID exist', async () => {
         const id = objectID;
         const res = await request(server).get(`/vidly.com/api/genres/${id}`);
         expect(res.status).toBe(404);
      });
   });

   describe('POST /', () => {

      //Refacring Principle :  Define the happy path, and then in each test, we change one parameter that clearly alligns with the name of the test.

      let token, genreName;

      //Define our happy path
      const exec = async () => {
         return await request(server)
            .post('/vidly.com/api/genres')
            .set('x-auth-token', token)
            .send({ name: genreName });
      }

      //Before each test, we set the parameters to valid values 
      beforeEach(() => {
         token = new User().generateAuthToken();
         genreName = 'genre1';
      });

      //In each test, depending on what we want to test, we modify one of these above mentioned parameters to simulate a scenerio.

      it('should return 401 if client is not logged in', async () => {

         token = ''; //Explicitly set this to an empty string to simulate that our client is not logged in.
         const res = await exec();

         expect(res.status).toBe(401);
      });

      it('should return 400 if genre is less than 5 characters', async () => {

         genreName = '1';
         const res = await exec();

         expect(res.status).toBe(400);
      });

      it('should return 400 if genre is more than 50 characters', async () => {

         genreName = new Array(52).join('a');
         const res = await exec();

         expect(res.status).toBe(400);
      });

      it('should return 400 if genre already exists', async () => {

         const genre = new Genre({ name: genreName });
         await genre.save();

         const res = await exec();
         expect(res.status).toBe(400);
      });

      it('should save the genre if it is valid', async () => {

         const res = await exec();
         const savedGenre = await Genre.find({ name: 'GENRE1' });
         //Using caps as we kept 'uppercase : true' in mongoose schema. So, when we save the 'genre1' doc through api, it will be saved in caps in DB.

         expect(savedGenre).not.toBeNull();
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('_id');
         expect(res.body).toHaveProperty('name', 'GENRE1');
      });
   });

   describe('PUT /:id', () => {

      let token, genre, id, newGenre;

      //Define our happy path
      const exec = () => {
         return request(server)
            .put('/vidly.com/api/genres/' + id)
            .set('x-auth-token', token)
            .send({ name: newGenre });
      }

      //Before each test, we set the parameters to valid values 
      beforeEach(async () => {
         genre = new Genre({ name: 'genre1' });
         id = genre._id.toHexString();

         //Not saving genre before every test case. As it is not needed for 401/404/400/400/404 test cases.
         //A legit document is needed in DB when we test the 200 case. As the code will not go till DB in other cases.

         newGenre = 'genre2';
         token = new User().generateAuthToken();
      });

      //In each test, depending on what we want to test, we modify one of these above mentioned parameters to simulate a scenerio.

      it('should return 401 if no token is provided', async () => {

         token = '';
         const res = await exec();
         expect(res.status).toBe(401);
      });

      it('should return 404 if invalid id is passed', async () => {

         id = '1';
         const res = await exec();

         expect(res.status).toBe(404);
      });

      it('should return 400 if genre is less than 5 characters', async () => {

         newGenre = 'a';
         const res = await exec();

         expect(res.status).toBe(400);
      });

      it('should return 400 if genre is more than 50 characters', async () => {

         newGenre = new Array(52).join('a');
         const res = await exec();

         expect(res.status).toBe(400);
      });

      it('should return 404 if no genre exists with the given ID', async () => {

         id = objectID;

         const res = await exec();
         expect(res.status).toBe(404);
      });

      it('should return 200 in case of happy path', async () => {
         await genre.save();

         const res = await exec();
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('_id', id);     //On line no : 150[ During the assignment of ID variable ] id to be converted to hexString, otherwise this expect statement fails.
         expect(res.body).toHaveProperty('name', newGenre.toUpperCase());
         //Using caps as we kept 'uppercase : true' in mongoose schema. So, when we save the 'genre2' doc through api, it will be saved in caps in DB.
      });
   });

   describe('DELETE /:id', () => {

      let token, genre, id;

      //Define our happy path
      const exec = () => {
         return request(server)
            .delete('/vidly.com/api/genres/' + id)
            .set('x-auth-token', token);
      }

      //Before each test, we set the parameters to valid values 
      beforeEach(async () => {
         genre = new Genre({ name: 'genre1' });
         id = genre._id.toHexString();  // Similar to the PUT route.

         const user = { _id: objectID, isAdmin: true };
         token = new User(user).generateAuthToken();
      });

      it('should return 401 if no token is provided', async () => {

         token = '';
         const res = await exec();
         expect(res.status).toBe(401);
      });

      it('should return 403 if user is not an Admin', async () => {

         token = new User({ _id: objectID, isAdmin: false }).generateAuthToken();
         const res = await exec();
         expect(res.status).toBe(403);
      });

      it('should return 404 if invalid id is passed', async () => {

         id = '1';
         const res = await exec();

         expect(res.status).toBe(404);
      });

      it('should return 404 if no genre exists with the given ID', async () => {

         id = objectID;

         const res = await exec();
         expect(res.status).toBe(404);
      });

      it('should return 200 if the genre is deleted', async () => {
         await genre.save();

         const res = await exec();
         expect(res.status).toBe(200);

         expect(res.body).toHaveProperty('_id', id);
         expect(res.body).toHaveProperty('name', genre.name.toUpperCase());

         //Improvision :
         // res.status(200).send(`Document deleted : ${result} `); --> This is the execution path for 200 in DELETE route. This case can only be tested with regrex.
         // Hence, changed the code in route in order to be more specific in the test cases.
      });
   });

});