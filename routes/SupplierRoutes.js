const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const authMiddleware = require('../middleware/authMiddleware');

// Add new supplier
router.post('/',authMiddleware, async (req, res) => {
  try {
    const { companyName, contact, gstNumber } = req.body;

    // Check for duplicates
    const existing = await Supplier.findOne({
      $or: [
        { companyName },
        { contact },
        { gstNumber }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Supplier with same companyName, contact or gstNumber already exists' });
    }

    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.find({businessId: req.businessId});
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update supplier
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { gstNumber, contact } = req.body;

    const conflicting = await Supplier.findOne({
      _id: { $ne: req.params.id },
      businessId: req.businessId,
      $or: [{ gstNumber }, { contact }]
    });

    if (conflicting) {
      return res.status(400).json({ error: 'GST Number or Contact already exists for another supplier' });
    }

    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.businessId, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
