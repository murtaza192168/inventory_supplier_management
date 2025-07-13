const Inventory = require('../models/Inventory');

// Add new inventory item
exports.createInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body, req.businessId);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({businessId: req.businessId}).populate('supplier');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get inventory item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id, req.businessId).populate('supplier');
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.businessId, req.body, { new: true, runValidators: true });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id, req.businessId);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
