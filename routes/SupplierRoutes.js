// // routes/SupplierRoutes.js

// const express = require('express');
// const router = express.Router();
// const  Supplier = require("../models/Supplier");

// // Add a route to add new supplier
// router.post('/api/suppliers', async (req, res) => {
//     try {
//       const newSupplier = new Supplier(req.body);
//       const saved = await newSupplier.save();
//       res.status(201).json(saved);
//     } catch (err) {
//       res.status(400).json({ error: err.message });
//     }
//   });
  
//   // Add a route to get all suppliers (for dropdown in inventory)
//   router.get('/api/suppliers', async (req, res) => {
//     try {
//       const suppliers = await Supplier.find();
//       res.json(suppliers);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });
//   module.exports = router;