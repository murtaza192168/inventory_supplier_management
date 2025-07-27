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
  // array of items
  items: [
    {
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String },
      purchasePrice: { type: Number, required: true },
      goodsWithGst: { type: Boolean },
      gstSlab: {
        type: Number,
        enum: [0, 5, 12, 18],
        required: function () {
          return this.goodsWithGst === true;
        }
      },
      totalCost: { type: Number },
      withGstBill: { type: Boolean }
    }
  ],
  amountPaid: {
    type: Number,
    required: true
  },

  paymentDate: {
    type: Date,
    default: Date.now
  },
  invoiceNo: {
    type: String,
    required: true, // ✅ Make it required
    match: /^\d{4}\/\d{2}-\d{2}$/, // ✅ Validate format like 0001/24-25
  },
  
  paymentMode: {
    type: String,
   enum: ['Cash', 'Cheque', 'Bank_Transfer', 'UPI'],
    required: true
  },
  paymentDate: {
  type: Date,
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
