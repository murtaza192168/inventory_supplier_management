const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// @route   POST /api/suppliers
// @desc    Add a new supplier
router.post('/', async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error });
  }
});

// @route   GET /api/suppliers
// @desc    Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
});

// @route   PUT /api/suppliers/:id/payment
// @desc    Update payment history for a supplier
router.put('/:id/payment', async (req, res) => {
  try {
    const { amount, modeOfPayment, reference, date, note } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    // Update payment history
    supplier.paymentHistory.push({ amount, modeOfPayment, reference, date, note });

    // Subtract amount from totalDue
    supplier.totalDue = supplier.totalDue - amount;

    const updatedSupplier = await supplier.save();
    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error });
  }
});

module.exports = router;
