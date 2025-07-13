exports.addSupplier = async (req, res) => {
  try {
    const { companyName, contact, gstNumber } = req.body;

    // Check for duplicate company name (case-insensitive) under the same business
    const existingCompany = await Supplier.findOne({
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
      businessId: req.businessId
    });

    if (existingCompany) {
      return res.status(400).json({ error: 'A supplier with this company name already exists.' });
    }

    const existingContact = await Supplier.findOne({ contact, businessId: req.businessId });
    if (existingContact) {
      return res.status(400).json({ error: 'A supplier with this contact number already exists.' });
    }

    if (gstNumber) {
      const existingGst = await Supplier.findOne({ gstNumber, businessId: req.businessId });
      if (existingGst) {
        return res.status(400).json({ error: 'A supplier with this GST number already exists.' });
      }
    }

    const newSupplier = new Supplier({
      companyName,
      contact,
      gstNumber,
      businessId: req.businessId
    });

    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const businessId = req.businessId; // ✅ Extracted from token using auth middleware
    const suppliers = await Supplier.find({ businessId }); // ✅ Filter by businessId
    res.status(200).json(suppliers);
 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, businessId: req.businessId });

    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, contact, gstNumber } = req.body;

    const supplier = await Supplier.findOne({ _id: id, businessId: req.businessId });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    if (contact && contact !== supplier.contact) {
      const existingContact = await Supplier.findOne({ contact, businessId: req.businessId });
      if (existingContact && existingContact._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this contact number.' });
      }
    }

    if (gstNumber && gstNumber !== supplier.gstNumber) {
      const existingGst = await Supplier.findOne({ gstNumber, businessId: req.businessId });
      if (existingGst && existingGst._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this GST number.' });
      }
    }

    if (companyName && companyName.toLowerCase() !== supplier.companyName.toLowerCase()) {
      const existingCompany = await Supplier.findOne({
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
        businessId: req.businessId
      });

      if (existingCompany && existingCompany._id.toString() !== id) {
        return res.status(400).json({ error: 'Another supplier already uses this company name.' });
      }
    }

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, businessId: req.businessId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findOneAndDelete({
      _id: req.params.id,
      businessId: req.businessId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
