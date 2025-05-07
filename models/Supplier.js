// Import mongoose
const mongoose = require("mongoose");

// Define schema
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  paymentHistory: [
    {
      amount: Number,
      modeOfPayment: String, // e.g., cash, cheque, upi
      reference: String, // e.g., cheque no., UPI ref
      date: Date,
      note: String
    }
  ],
  totalDue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Export model
module.exports = mongoose.model("Supplier", supplierSchema);
