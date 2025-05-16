const SupplierPayment = require('../models/SupplierPayment');

// Add a new payment
exports.addPayment = async (req, res) => {
  try {
    const payment = new SupplierPayment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await SupplierPayment.find().populate('supplierId', 'name phone');
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payments for a specific supplier
exports.getPaymentsBySupplier = async (req, res) => {
  try {
    const payments = await SupplierPayment.find({ supplierId: req.params.supplierId });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const updated = await SupplierPayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    await SupplierPayment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
