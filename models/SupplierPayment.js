// models/SupplierPayment.js

const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  productName: {
  type: String,
  trim: true
},

  paymentDate: {
    type: Date,
    default: Date.now
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
   enum: ['Cash', 'Cheque', 'Bank_Transfer', 'UPI'],
    required: true
  },
  goodsWithGst: {
    type: Boolean,
    
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
