const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Create new inventory item
router.post('/', inventoryController.createInventory);

// Get all inventory items
router.get('/', inventoryController.getAllInventory);

// Get inventory by ID
router.get('/:id', inventoryController.getInventoryById);

// Update inventory item
router.put('/:id', inventoryController.updateInventory);

// Delete inventory item
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;
