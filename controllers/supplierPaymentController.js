// controllers/supplierPaymentController.js
const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');
const Inventory = require('../models/Inventory');

// Add a new supplier payment and update supplier's balance
// controllers/supplierPaymentController.js

exports.addSupplierPayment = async (req, res) => {
  try {
    const {
      supplierId,
      amountPaid,
      paymentMode,
      paymentNote,
      items,
      invoiceNo = req.body.invoiceNo?.trim(),
      paymentDate
    } = req.body;

    if (!req.businessId) return res.status(401).json({ error: 'No token / business ID provided' });

    if (amountPaid > 0 && !paymentDate) {
      return res.status(400).json({ error: 'Payment date is required when amountPaid is greater than 0' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const invoicePattern = /^\d{4}\/\d{2}-\d{2}$/;
    if (!invoicePattern.test(invoiceNo)) {
      return res.status(400).json({ error: 'Invoice number must be in format "0001/24-25"' });
    }

    if (amountPaid !== undefined && amountPaid < 0) {
      return res.status(400).json({ error: 'Amount paid cannot be negative' });
    }
 


    let totalAmount = 0;
       // Check total due across this invoice + previous supplier balance
const currentOutstanding = supplier.balanceAmount + totalAmount;

// Prevent overpayment beyond actual due
if (amountPaid > currentOutstanding) {
  return res.status(400).json({
    error: `Amount paid (${amountPaid}) exceeds current outstanding balance (${currentOutstanding}).`
  });
}
    const processedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const {
          productName,
          quantity,
          unit,
          purchasePrice,
          goodsWithGst,
          gstSlab,
          withGstBill
        } = item;

        if (!productName || !quantity || !purchasePrice) {
          return res.status(400).json({ error: 'Each item must include productName, quantity, and purchasePrice' });
        }

        const validGstSlabs = [0, 5, 12, 18];
        if (gstSlab !== undefined && !validGstSlabs.includes(gstSlab)) {
          return res.status(400).json({ error: 'Invalid GST slab value' });
        }

        if (gstSlab !== undefined && gstSlab !== 0 && goodsWithGst === false) {
          return res.status(400).json({ error: 'GST slab is applied but goods marked as without GST bill' });
        }

        const gstMultiplier = withGstBill && gstSlab ? (1 + gstSlab / 100) : 1;
        const totalCost = quantity * purchasePrice * gstMultiplier;
        totalAmount += totalCost;

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

        processedItems.push({
          productName,
          quantity,
          unit,
          purchasePrice,
          goodsWithGst,
          gstSlab,
          withGstBill,
          totalCost
        });
      }
    }

    // 🔁 Check if invoice already exists
    let payment = await SupplierPayment.findOne({
      invoiceNo,
      supplierId,
      businessId: req.businessId
    });

    if (payment) {
      // Partial payment / update
      payment.amountPaid += amountPaid;
      payment.remainingBalance -= amountPaid;

      if (processedItems.length > 0) {
        payment.items.push(...processedItems); // Add new items if given
      }

      payment.paymentNote = paymentNote || payment.paymentNote;
      payment.paymentMode = paymentMode || payment.paymentMode;
      payment.paymentDate = paymentDate || payment.paymentDate;

      await payment.save();
    } else {
      // New invoice & payment
      payment = new SupplierPayment({
        supplierId,
        invoiceNo,
        amountPaid,
        paymentMode,
        paymentNote,
        paymentDate,
        items: processedItems,
        businessId: req.businessId,
        remainingBalance: totalAmount - amountPaid
      });
      await payment.save();
    }

    // ✅ Update supplier balance
    supplier.balanceAmount += totalAmount;
    supplier.balanceAmount -= amountPaid;
    await supplier.save();

    res.status(201).json({ message: 'Payment recorded successfully', payment });

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

    const query = { businessId: req.businessId };

    // Filter by payment date range
    if (paymentStartDate && paymentEndDate) {
      query.date = {
        $gte: new Date(paymentStartDate),
        $lte: new Date(paymentEndDate),
      };
    }

    // Filter by payment mode
    if (paymentMode) {
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

    // ✅ NEW: Filter by productName from the `items` array inside SupplierPayment
    if (productName) {
      const lowerProductName = productName.toLowerCase();
      payments = payments.filter(payment =>
        payment.items?.some(item =>
          item.productName?.toLowerCase().includes(lowerProductName)
        )
      );
    }

    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching supplier payments:", err);
    res.status(500).json({ error: err.message });
  }
};





// Get all payments for a specific supplier
exports.getPaymentsBySupplier = async (req, res) => {
  try {
    const { financialYear } = req.query;

    const query = {
      supplierId: req.params.supplierId,
      businessId: req.businessId,
    };
    if (financialYear) {
      query.financialYear = financialYear;
    }
    const payments = await SupplierPayment.find(query).sort({ date: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update item array in SupplierPayment and reflect in Inventory + Supplier balance
exports.updatePaymentItem = async (req, res) => {
  try {
    const { paymentId, itemId, newQuantity, newPurchasePrice } = req.body;

    if (!paymentId || !itemId) {
      return res.status(400).json({ error: 'paymentId and itemId are required' });
    }

    const payment = await SupplierPayment.findOne({ _id: paymentId, businessId: req.businessId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const itemIndex = payment.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not found in payment' });

    const item = payment.items[itemIndex];
    const oldTotal = item.totalCost;

    // Apply changes
    if (newQuantity !== undefined) item.quantity = newQuantity;
    if (newPurchasePrice !== undefined) item.purchasePrice = newPurchasePrice;

    const gstMultiplier = item.withGstBill && item.gstSlab ? (1 + item.gstSlab / 100) : 1;
    item.totalCost = item.quantity * item.purchasePrice * gstMultiplier;

    const costDifference = item.totalCost - oldTotal;
    payment.remainingBalance += costDifference;
    await payment.save();

    // Update the inventory item too
    const inventoryItem = await Inventory.findOne({
      productName: item.productName,
      supplier: payment.supplierId,
      businessId: req.businessId,
      totalCost: oldTotal // match old cost to find exact record
    });

    if (inventoryItem) {
      inventoryItem.quantity = item.quantity;
      inventoryItem.purchasePrice = item.purchasePrice;
      inventoryItem.totalCost = item.totalCost;
      await inventoryItem.save();
    }

    // Update supplier balance
    const supplier = await Supplier.findById(payment.supplierId);
    if (supplier) {
      supplier.balanceAmount += costDifference;
      await supplier.save();
    }

    res.status(200).json({
      message: 'Item updated successfully in payment & inventory',
      updatedItem: item,
      updatedRemainingBalance: payment.remainingBalance,
      updatedSupplierBalance: supplier?.balanceAmount || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Delete a payment
// Delete a specific payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const deleted = await SupplierPayment.findOneAndDelete({
      _id: req.params.id,
      businessId: req.businessId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Payment not found or already deleted' });
    }

    res.status(200).json({ message: 'Supplier payment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

