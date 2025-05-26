// controllers/supplierController.js

const Supplier = require('../models/Supplier');

// Add supplier
exports.addSupplier = async (req, res) => {
    try {

        // edge cases
        const { companyName, contact, gstNumber } = req.body;

        // Check for duplicate companyName (case-insensitive)
        const existingCompany = await Supplier.findOne({
          companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
        });
    
        if (existingCompany) {
          return res.status(400).json({ error: 'A supplier with this company name already exists.' });
        }
    
        // Check for duplicate contact
        const existingContact = await Supplier.findOne({ contact });
        if (existingContact) {
          return res.status(400).json({ error: 'A supplier with this contact number already exists.' });
        }
    
        // Check for duplicate gstNumber if provided
        if (gstNumber) {
          const existingGst = await Supplier.findOne({ gstNumber });
          if (existingGst) {
            return res.status(400).json({ error: 'A supplier with this GST number already exists.' });
          }
        }
    

      const newSupplier = new Supplier(req.body);
      await newSupplier.save();
      res.status(201).json(newSupplier);
    } catch (error) {
     
      res.status(400).json({ error: error.message });
    }
  };
  

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.status(200).json(supplier);
  } catch (error) {
    
    res.status(500).json({ error: error.message });
  }
};

// Update supplier
// Update a supplier
exports.updateSupplier = async (req, res) => {
    try {

        // edge cases
        const { id } = req.params;
    const { companyName, contact, gstNumber } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    // Check if contact belongs to another supplier
    if (contact && contact !== supplier.contact) {
      const existingContact = await Supplier.findOne({ contact });
      if (existingContact && existingContact._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this contact number.' });
      }
    }

    // Check if gstNumber belongs to another supplier
    if (gstNumber && gstNumber !== supplier.gstNumber) {
      const existingGst = await Supplier.findOne({ gstNumber });
      if (existingGst && existingGst._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this GST number.' });
      }
    }

    // Check if companyName belongs to another supplier (case-insensitive)
    if (companyName && companyName.toLowerCase() !== supplier.companyName.toLowerCase()) {
      const existingCompany = await Supplier.findOne({
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
      });

      if (existingCompany && existingCompany._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this company name.' });
      }
    }
    
      const updatedSupplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedSupplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      res.status(200).json(updatedSupplier);
    } catch (error) {
      
      res.status(400).json({ error: error.message });
    }
  };
  
  

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
