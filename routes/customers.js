const express = require('express');
const router = express.Router();
const { Customer, validate } = require('../models/customer');
const validateID = require('../models/id');
const auth = require('../middleware/auth');
const adminAccess = require('../middleware/admin');

router.get('/', async (req, res) => {
   const customers = await Customer.find().sort('name').select(['_id', 'name', 'phone']);
   res.status(200).send(customers);
});

router.get('/:id', async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Error : Invalid ID !!!`);

   const customer = await Customer.findById(req.params.id).select(['_id', 'name', 'phone']);
   if (!customer) return res.status(404).send(`customer with id: ${req.params.id} not found!!`);

   res.status(200).send(customer);
});

router.post('/', auth, async (req, res) => {
   //validate payload
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   let customer = await Customer.findOne({ name: req.body.name.toUpperCase() });
   if (customer) return res.status(404).send(`customer with name: ${req.body.name} Already Exists!!`);

   customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold    //This will not throw error even if UI doesn't pass this, as we have defined a default value in mongoose schema
   });

   await customer.save();
   res.status(200).send(customer);
});

router.put('/:id', auth, async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Error : Invalid ID !!!`);

   //validate payload
   const { error } = validate(req.body);
   if (error) return res.status(400).send(error.message);

   const result = await Customer.findByIdAndUpdate(req.params.id, {
      $set: {
         name: req.body.name,
         phone: req.body.phone,
         isGold: req.body.isGold
      }
   }, { new: true });

   if (!result) res.status(404).send(`Customer with id: ${req.params.id} not found!!`);
   else res.status(200).send(result);
});

router.delete('/:id', auth, adminAccess, async (req, res) => {
   if (!validateID(req.params.id))
      return res.status(400).send(`Error : Invalid ID !!!`);

   const result = await Customer.findByIdAndDelete(req.params.id);
   if (!result) res.status(404).send(`Customer with id: ${req.params.id} not found!!`);
   else res.status(200).send(`Deleted record : ${result}`);
});


module.exports = router;