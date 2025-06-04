const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('supplier');
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
