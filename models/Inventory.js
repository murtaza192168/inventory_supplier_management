// models/Inventory.js

const mongoose = require('mongoose');

// Define the Inventory Schema
const inventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  brand: { type: String },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true,default: 0 },
  // ratePerUnit: { type: Number, required: true },
  // gstPercent: { type: Number, enum: [5, 12, 18], required: true },
  costPrice: {
    type: Number,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },  
  purchaseDate: { type: Date, default: Date.now },
  // totalAmount: { type: Number }, // Calculated 
  // note: { type: String },
  // paymentMode: { type: String, enum: ['Cash', 'Cheque', 'UPI'] }, 
  // chequeNumber: { type: String }, // Optional, only if paymentMode is Cheque 
  // paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' }, 
  // creditNote: { type: String } 
});

// Pre-save hook to calculate total amount (excluding GST)
// inventorySchema.pre('save', function (next) {
//   const baseAmount = this.quantity * this.ratePerUnit;
//   const gstAmount = baseAmount * (this.gstPercent / 100);
//   this.totalAmount = baseAmount + gstAmount;
//   next();
// });

module.exports = mongoose.model('Inventory', inventorySchema);
