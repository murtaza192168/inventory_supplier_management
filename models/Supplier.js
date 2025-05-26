// models/Supplier.js

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Phn no. is required'],
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number`
    }
  },
  email: {
    unique:true,
    type: String,
    trim: true
  },
  address: {
    type: String,
  },
  gstNumber: {
    type: String,
    unique: true,
    sparse: true, // allows null/undefined but still enforces uniqueness if provided
    validate: {
      validator: function (v) {
        return v ? /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) : true;
      },
      message: props => `${props.value} is not a valid GST number`
    }
  },
  companyName: {
    unique: true,
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);
