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

// GET route to fetch all inventory items
router.get('/all', async (req, res) => {
    try {
      // Fetch all inventory items from the database
      const inventoryItems = await Inventory.find().sort({ purchaseDate: -1 }); // sorted by most recent
  
      // Send the fetched items as JSON
      res.status(200).json(inventoryItems);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  });
  

module.exports = router;
