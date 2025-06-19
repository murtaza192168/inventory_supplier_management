// controllers/supplierPaymentController.js
const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');
const Inventory = require('../models/Inventory');

// Add a new supplier payment and update supplier's balance
exports.addSupplierPayment = async (req, res) => {
  try {
    const {
      goodsWithGst,
      gstSlab,
      quantity,
      purchasePrice,
      supplierId,
      withGstBill,
      productName,
      unit,
      amountPaid,
      totalAmount,
      paymentMode,       
      paymentNote
    } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    // Validate GST slab
    const validGstSlabs = [0, 5, 12, 18];
    if (!validGstSlabs.includes(gstSlab)) {
      return res.status(400).json({ error: 'Invalid GST slab value' });
    }

    // Check for invalid GST + bill combo
    if (gstSlab !== 0 && !goodsWithGst) {
      return res.status(400).json({ error: 'GST slab is applied but goods marked as without GST bill' });
    }


    if (amountPaid <= 0) return res.status(400).json({ error: 'Amount must be greater than 0' });

    // Auto-calculate totalAmount if not provided and GST is applicable
    let finalTotalAmount = totalAmount;
    if (!totalAmount && gstSlab !== 0) {
      finalTotalAmount = amountPaid * (1 + gstSlab / 100);
    }

    // Optional: amountPaid shouldn't exceed totalAmount
    if (finalTotalAmount && amountPaid > finalTotalAmount) {
      return res.status(400).json({ error: 'Amount paid cannot exceed total amount' });
    }

   

    const payment = new SupplierPayment({
      supplierId,
      amountPaid,
      paymentMode,
      paymentNote,
      date: new Date(),
    });
    await payment.save();

    let totalCost = 0;
    if (quantity && productName && purchasePrice) {
      const gstMultiplier = withGstBill && gstSlab !== 0 ? (1 + gstSlab / 100) : 1;
       totalCost = quantity * purchasePrice * gstMultiplier;

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

      // Add the full cost to supplier again (this reverses the previous subtraction)
      supplier.balanceAmount += totalCost;
      supplier.balanceAmount = Math.max(0, supplier.balanceAmount - amountPaid);
      await supplier.save();
    }

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payments
// Get all payments with advanced filtering
exports.getAllSupplierPayments = async (req, res) => {
  try {
    const {
      supplierName,
      paymentMode,
      paymentStartDate,
      paymentEndDate,
      productName,
      minAmountPaid,
      maxAmountPaid
    } = req.query;

    const query = {};

    // Filter by payment date range
    if (paymentStartDate && paymentEndDate) {
      query.date = {
        $gte: new Date(paymentStartDate),
        $lte: new Date(paymentEndDate),
      };
    }

    // Filter by payment mode
    if (paymentMode) {
      query.paymentMode = paymentMode.toLowerCase();
    }

    // Filter by amountPaid range
    if (minAmountPaid || maxAmountPaid) {
      query.amountPaid = {};
      if (minAmountPaid) query.amountPaid.$gte = Number(minAmountPaid);
      if (maxAmountPaid) query.amountPaid.$lte = Number(maxAmountPaid);
    }

    // Initial fetch
    let payments = await SupplierPayment.find(query)
      .populate({
        path: 'supplierId',
        select: 'companyName contact',
      })
      .sort({ date: -1 });

    // Filter by supplier name (post population)
    if (supplierName) {
      payments = payments.filter(payment =>
        payment.supplierId?.companyName
          ?.toLowerCase()
          .includes(supplierName.toLowerCase())
      );
    }

    // Filter by product name (through Inventory match)
    if (productName) {
      const inventories = await Inventory.find({
        productName: { $regex: productName, $options: 'i' }
      }).select('supplier');

      const supplierIdsWithProduct = inventories.map(item => item.supplier.toString());

      payments = payments.filter(payment =>
        supplierIdsWithProduct.includes(payment.supplierId?._id?.toString())
      );
    }

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

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { amountPaid, gstSlab, goodsWithGst, totalAmount } = req.body;

    // Validate GST slab
    const validGstSlabs = [0, 5, 12, 18];
    if (gstSlab !== undefined && !validGstSlabs.includes(gstSlab)) {
      return res.status(400).json({ error: 'Invalid GST slab value' });
    }

    // Check for invalid GST + bill combo
    if (gstSlab !== undefined && gstSlab !== 0 && goodsWithGst === false) {
      return res.status(400).json({ error: 'GST slab is applied but goods marked as without GST bill' });
    }

    // Prevent zero or negative payment
    if (amountPaid !== undefined && amountPaid <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    // Optional: amountPaid shouldn't exceed totalAmount
    if (totalAmount && amountPaid > totalAmount) {
      return res.status(400).json({ error: 'Amount paid cannot exceed total amount' });
    }

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
