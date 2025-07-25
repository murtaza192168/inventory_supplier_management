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
      invoiceNo,
      amountPaid,
      totalAmount,
      paymentMode,       
      paymentNote,
      
    
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

    // Invoice No. Format Validation
const invoicePattern = /^\d{3}\/\d{2}-\d{2}$/;
if (!invoicePattern.test(invoiceNo)) {
  return res.status(400).json({ error: 'Invoice number format must be like 001/24-25' });
}
// ✅ Check for duplicate invoiceNo for the same supplier & business
const duplicateInvoice = await SupplierPayment.findOne({
  invoiceNo,
  businessId: req.businessId,
  supplierId
});
if (duplicateInvoice) {
  return res.status(400).json({ error: 'Invoice number already exists for this supplier.' });
}



   

    const payment = new SupplierPayment({
      supplierId,
      invoiceNo,
      amountPaid,
      paymentMode,
      paymentNote,
      
      date: new Date(),
      businessId: req.businessId,
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
        supplier: supplierId,
        businessId: req.businessId
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
      maxAmountPaid,
      page = 1,
      limit = 10,
      sortBy = 'date',
      order = 'desc'
    } = req.query;

    const query = {businessId: req.businessId};

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
      query.paymentMode = { $regex: new RegExp(`^${paymentMode}$`, 'i') };

    }

    // Filter by amountPaid range
    if (minAmountPaid || maxAmountPaid) {
      query.amountPaid = {};
      if (minAmountPaid) query.amountPaid.$gte = Number(minAmountPaid);
      if (maxAmountPaid) query.amountPaid.$lte = Number(maxAmountPaid);
    }

    // Initial fetch with pagination + sorting
    let payments = await SupplierPayment.find(query)
      .populate({ path: 'supplierId', select: 'companyName contact' })
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

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
    const payments = await SupplierPayment.find({ supplierId: req.params.supplierId, businessId: req.businessId });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { amountPaid, gstSlab, goodsWithGst, totalAmount, invoiceNo, supplierId } = req.body;

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
    if (amountPaid !== undefined && amountPaid < 0) {
      return res.status(400).json({ error: 'Please mention the amount paid' });
    }

    // Optional: amountPaid shouldn't exceed totalAmount
    if (totalAmount && amountPaid > totalAmount) {
      return res.status(400).json({ error: 'Amount paid cannot exceed total amount' });
    }

    // Check for duplicate invoice number if it's being updated
    if (invoiceNo) {
      const duplicateInvoice = await SupplierPayment.findOne({
        _id: { $ne: req.params.id }, // Exclude current payment
        invoiceNo,
        supplierId,
        businessId: req.businessId,
      });

      if (duplicateInvoice) {
        return res.status(400).json({ error: 'Invoice number already exists for this supplier.' });
      }

      // Validate invoice format: "number/yy-yy"
      const invoicePattern = /^\d+\/\d{2}-\d{2}$/;
      if (!invoicePattern.test(invoiceNo)) {
        return res.status(400).json({ error: 'Invoice number must be in format "number/yy-yy"' });
      }
    }


    const updated = await SupplierPayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
  return res.status(404).json({ error: 'Payment not found' });
}

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
