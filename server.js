// server.js

// Importing required packages
const express = require('express');        // For creating server and APIs
const mongoose = require('mongoose');      // To connect and work with MongoDB
const cors = require('cors');              // To handle requests from frontend (React)
const dotenv = require('dotenv');          // To use environment variables from .env file



// Configure dotenv to read .env variables
dotenv.config();

// Initialize express app
const app = express();
// Import supplier routes
const supplierRoutes = require('./routes/SupplierRoutes');
// Import SuplierPayment route
const supplierPaymentRoutes = require('./routes/supplierPaymentRoutes');
// Middlewares
app.use(cors());                           // Allow cross-origin requests
app.use(express.json());                   // Allow receiving JSON data from frontend



// Set up a test route to check if server is working
app.get('/', (req, res) => {
  res.send('Inventory Management Backend Server is Running!');
});

// Connect to MongoDB database using mongoose
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected Successfully');
}).catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

app.use('/api/suppliers', supplierRoutes);
app.use('/api/payments', supplierPaymentRoutes);

// Define a port (default to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
    