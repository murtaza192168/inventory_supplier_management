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
    enum: ['kg', 'ltr', 'pcs', 'ctn', 'mtr', 'pack', 'other'],
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
    required: true
  },
  totalCost: {
    type: Number,
    required: true
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

module.exports = mongoose.model('Inventory', inventorySchema);




