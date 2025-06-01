// models/SupplierPayment.js

const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  amountPaid: {
    type: Number,
    required: true
  },
  goodsWithGst: {
    type: Boolean,
    required: true
  },
  gstSlab: {
    type: Number,
    enum: [0, 5, 12, 18],
    required: function () {
      return this.goodsWithGst === true;
    }
  },
  description: String,
  remainingBalance: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupplierPayment', supplierPaymentSchema);
