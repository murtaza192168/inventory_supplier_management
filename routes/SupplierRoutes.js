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
// Delete a supplier by ID
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Supplier.findByIdAndDelete(id);
      res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting supplier' });
    }
  });
 // Update a supplier by ID
router.put('/:id', async (req, res) => {
    try {
      const updatedSupplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name,
            contact: req.body.contact,
            email: req.body.email,
            address: req.body.address
          }
        },
        { new: true }
      );
  
      if (!updatedSupplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
  
      res.status(200).json(updatedSupplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({ message: 'Server error while updating supplier' });
    }
  });
   

module.exports = router;
