const express = require('express');
const router = express.Router();
const { Genre, validate } = require('../models/genre');
const auth = require('../middleware/auth');
const adminAccess = require('../middleware/admin');
// const validateID = require('../models/id');
const validateID = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
   // throw new Error('Test winston');
   const genres = await Genre.find().sort({ name: 1 }).select(['_id', 'name']);
   res.status(200).send(genres);
});

router.get('/:id', validateID, async (req, res) => {

   //Search by id ->  Name functionality for now omitted
   const genre = await Genre.findById(req.params.id).select(['_id', 'name']);

   if (!genre) res.status(404).send(`genre with id: ${req.params.id} not found!!`);
   else res.status(200).send(genre);
});

router.post('/', auth, async (req, res) => {
   //Payload Validation
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const genre = await Genre.find({ name: req.body.name });
   if (genre.length === 0) {

      const newGenre = new Genre({ name: req.body.name });
      await newGenre.save();
      res.status(200).send(newGenre);
   }
   else res.status(400).send(`genre with name: ${req.body.name} already exists!!`);
});

router.put('/:id', auth, validateID, async (req, res) => {

   //payload Validation
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const result = await Genre.findByIdAndUpdate(req.params.id, {
      //mongoDB update operators
      $set: {
         name: req.body.name
      }
   }, { new: true });

   if (!result) res.status(404).send(`genre with id: ${req.params.id} not found!!`);
   else res.status(200).send(result);
});

router.delete('/:id', auth, adminAccess, validateID, async (req, res) => {
   //Delete by id or Name functionality -> for now omitted
   //Remove by id ->  await Genre.findByIdAndRemove(id)

   const result = await Genre.findByIdAndDelete(req.params.id);

   if (!result) res.status(404).send(`genre with ID: ${req.params.id} not found!!`);
   // else res.status(200).send(`Document deleted : ${result} `);
   else res.status(200).send(result);
});

module.exports = router;
