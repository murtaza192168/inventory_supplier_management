// models/Inventory.js

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'ltr', 'pc', 'ctn', 'mtr', 'pack', 'other'],
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  gstSlab: {
    type: Number,
    enum: [0, 5, 12, 18],
    default: 0
  },
  withGstBill: {
    type: Boolean,
    default: false
  },
  totalCost: {
    type: Number
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to calculate totalCost
inventorySchema.pre('save', function (next) {
  const gstMultiplier = this.withGstBill ? (1 + this.gstSlab / 100) : 1;
  this.totalCost = this.quantity * this.purchasePrice * gstMultiplier;
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
