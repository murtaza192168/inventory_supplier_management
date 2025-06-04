// routes/supplierPaymentRoutes.js
const express = require('express');
const router = express.Router();
const supplierPaymentController = require('../controllers/supplierPaymentController');

router.post('/', supplierPaymentController.addSupplierPayment);
router.get('/', supplierPaymentController.getAllSupplierPayments);
router.get('/:supplierId', supplierPaymentController.getPaymentsBySupplier);
// router.put('/:id', supplierPaymentController.updatePayment);
// router.delete('/:id', supplierPaymentController.deletePayment);

module.exports = router;
