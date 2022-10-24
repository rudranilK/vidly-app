const request = require('supertest');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const mongoose = require('mongoose');
const moment = require('moment');

describe('/api/returns', () => {
   let server;
   let rental, customerId, movieId, movie; //As we'll use this ID's when posting a request
   //We could have also used 'rental.customer._id' & 'rental.movie._id'

   let token;

   const exec = () => {
      return request(server)
         .post('/vidly.com/api/returns')
         .set('x-auth-token', token)
         .send({ customerId, movieId });
   };

   beforeEach(async () => {
      server = require('../../index');

      customerId = mongoose.Types.ObjectId();
      movieId = mongoose.Types.ObjectId();
      token = new User().generateAuthToken();

      // movie = Object.assign({}, rental.movie); // { ...rental.movie }
      // movie.numberInStock = 0;
      // movie.genre = {
      //    _id: mongoose.Types.ObjectId(),
      //    name: '12345'
      // };
      //movie = new Movie(movie);

      movie = new Movie({
         _id: movieId,
         title: '12345',
         genre: { name: '12345' },
         dailyRentalRate: 2,
         numberInStock: 0
      });
      await movie.save();

      rental = new Rental({
         customer: {
            _id: customerId,
            name: '12345',
            phone: '9876012345'
         },
         movie: {
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2
         }
      });
      await rental.save();
   });

   afterEach(async () => {
      await Rental.remove({});
      await Movie.remove({});
      await server.close();
   });

   it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();

      expect(res.status).toBe(401);
   });

   it('should return 400 if customerId not provided', async () => {
      customerId = '';
      const res = await exec();

      expect(res.status).toBe(400);
   });

   it('should return 400 if movieId not provided', async () => {
      movieId = '';
      const res = await exec();

      expect(res.status).toBe(400);
   });

   it('should return 404 if rental not found', async () => {
      await Rental.remove({});
      const res = await exec();

      expect(res.status).toBe(404);
   });

   it('should return 400 if return already processed', async () => {

      // await Rental.findOneAndUpdate({ 'customer._id': customerId, 'movie._id': movieId },
      // { dateReturned: new Date() });

      rental.dateReturned = new Date();
      await rental.save();

      const res = await exec();
      expect(res.status).toBe(400);
   });

   it('should return 200 if input is valid', async () => {

      const res = await exec();
      expect(res.status).toBe(200);
   });

   it('should set the dateReturned property if input is valid', async () => {
      const res = await exec();

      const rentalInDB = await Rental.findById(rental._id);
      // const timeGap = new Date() - rentalInDB.dateReturned; // [ Time difference in mili seconds]
      // expect(timeGap).toBeLessThan(10 * 1000);  //10 secs

      const timeGap = moment().diff(rentalInDB.dateOut, 'seconds');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('dateReturned');

      // expect(rentalInDB.dateReturned).toBeDefined();
      expect(rentalInDB).toHaveProperty('dateReturned');
      expect(timeGap).toBeLessThan(10);  //10 secs
   });

   it('should set the rentalFee property if input is valid', async () => {

      const rentedDays = 7;

      // var d = new Date();
      // rental.dateOut = d.setDate(d.getDate() - 1);

      rental.dateOut = moment().add(-rentedDays, 'days');

      //moment().add(-rentedDays, 'days').toDate() -> No ned -> got 14 in return anyway.
      //[ used res.status(200).send({ fee: rental.rentalFee })] -> to see the returned value.

      await rental.save();

      const res = await exec();

      const rentalInDB = await Rental.findById(rental._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rentalFee', rental.movie.dailyRentalRate * rentedDays);

      // expect(rentalInDB.rentalFee).toBeGreaterThan(0);
      // expect(rentalInDB.rentalFee).toBeGreaterThanOrEqual(rental.movie.dailyRentalRate);
      expect(rentalInDB.rentalFee).toBeCloseTo(rental.movie.dailyRentalRate * rentedDays);
   });

   it('should increase noInstock for the movie if input is valid', async () => {
      const res = await exec();

      const movieInDB = await Movie.findById(movieId);

      expect(res.status).toBe(200);
      expect(movieInDB).toHaveProperty('numberInStock', 1);
   });

   it('should return rental if input is valid', async () => {
      const res = await exec();

      // const rentalInDB = await Rental.findById(rental._id);
      // expect(res.body).toMatchObject(rentalInDB);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', rental._id.toHexString());
      expect(res.body).toHaveProperty('dateOut');
      expect(res.body).toHaveProperty('dateReturned');
      expect(res.body).toHaveProperty('rentalFee');
      expect(res.body).toHaveProperty('customer');
      expect(res.body).toHaveProperty('movie');

      //Alternate code :
      expect(Object.keys(res.body)).toEqual(
         expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'])
      );
   });

   //POST /api/returns {customerId, movieId}

   // Returns 401 if client is not logged in
   // Returns 400 if customerId is not provided
   // Returns 400 if movieId is not provided
   // Returns 404 if no rental found for this combo
   // Returns 400 if rental already processed i.e. movie is already returned
   // Returns 200 if valid request
   // Set the return date
   // Calculate the rental fee
   // Increase noInstock property for the movie
   // Return the rental i.e. dateOut, rentalFee , dateReturned etc.
});