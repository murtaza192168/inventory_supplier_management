// routes/inventoryRoutes.js

const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// POST route to add new inventory item
router.post('/add', async (req, res) => {
  try {
    // Create a new Inventory document from the request body
    const newItem = new Inventory(req.body);

    // Save to MongoDB
    await newItem.save();

    // Return success response
    res.status(201).json({ message: 'Inventory item added successfully', data: newItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
