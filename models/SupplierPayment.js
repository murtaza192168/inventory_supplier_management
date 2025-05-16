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
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'],
    default: 'Cash'
  },
  goodsWithGst: {
    type: Boolean,
    required: true
  },
  gstPercentage: {
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
