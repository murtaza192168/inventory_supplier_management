// routes/inventory.js

const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// CREATE - Add a new inventory item
router.post('/add', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Get all inventory items with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    const { brand, productName, supplierId } = req.query;

    if (brand) filter.brand = brand;
    if (productName) filter.productName = new RegExp(productName, 'i'); // case-insensitive match
    if (supplierId) filter.supplierId = supplierId;

    const items = await Inventory.find(filter).populate('supplierId');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Remove an inventory item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
