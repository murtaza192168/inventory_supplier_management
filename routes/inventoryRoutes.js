const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/authMiddleware');


// Get all inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inventory = await Inventory.find({businessId: req.businessId}).populate('supplier');
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
