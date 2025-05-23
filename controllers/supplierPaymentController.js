// supplierPaymentController.js
const SupplierPayment = require('../models/SupplierPayment');
const Inventory = require('../models/Inventory');

// Add a new payment
exports.addPayment = async (req, res) => {
  try {
    const { goodsWithGst, gstSlab, quantity, purchasePrice, supplierId, withGstBill, productName, unit } = req.body;

    // Create the supplier payment entry
    const payment = new SupplierPayment(req.body);
    await payment.save();

    // If inventory needs to be updated
    if (quantity && productName && purchasePrice && supplierId) {
      const gstMultiplier = withGstBill && gstSlab !== 0 ? (1 + gstSlab / 100) : 1;
      const totalCost = quantity * purchasePrice * gstMultiplier;

      const inventoryItem = new Inventory({
        productName,
        quantity,
        unit,
        purchasePrice,
        gstSlab,
        withGstBill,
        totalCost,
        supplier: supplierId
      });

      await inventoryItem.save();
    }

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
