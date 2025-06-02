// controllers/supplierPaymentController.js
const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');
const Inventory = require('../models/Inventory');

// Add a new supplier payment and update supplier's balance
exports.addSupplierPayment = async (req, res) => {
  try {
    const { supplierId, amountPaid, paymentMode, paymentNote } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    if (amountPaid <= 0) return res.status(400).json({ error: 'Amount must be greater than 0' });

    if (amountPaid > supplier.balance) {
      return res.status(400).json({ error: 'Amount paid exceeds remaining balance' });
    }

    const payment = new SupplierPayment({
      supplierId,
      amountPaid,
      paymentMode,
      paymentNote,
      date: new Date(),
    });
    await payment.save();

    supplier.balance -= amountPaid;
    await supplier.save();

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payments
exports.getAllSupplierPayments = async (req, res) => {
  try {
    const payments = await SupplierPayment.find().populate('supplierId', 'name');
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payments for a specific supplier
exports.getPaymentsBySupplier = async (req, res) => {
  try {
    const payments = await SupplierPayment.find({ supplierId: req.params.supplierId });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
