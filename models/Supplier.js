// models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    unique: true, // Unique company name
    trim: true
  },
  contact: {
    type: String,
    required: true,
    unique: true, // No duplicate contact numbers
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number`
    }
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true, // No duplicate GST numbers
    // sparse: true, // allows null/undefined but still enforces uniqueness if provided
    validate: {
      validator: function (v) {
        return v ? /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) : true;
      },
      message: props => `${props.value} is not a valid GST number`
    }
  },
  address: {
    type: String
  },
  balanceAmount: {
    type: Number,
    default: 0 // This is the total pending payment to the supplier
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);





