// routes/supplierPaymentRoutes.js
const express = require('express');
const router = express.Router();
const supplierPaymentController = require('../controllers/supplierPaymentController');
const  verifyToken  = require('../middleware/authMiddleware');

router.post('/', verifyToken, supplierPaymentController.addSupplierPayment);
router.get('/', verifyToken, supplierPaymentController.getAllSupplierPayments);
router.get('/:supplierId',verifyToken, supplierPaymentController.getPaymentsBySupplier);
router.put('/:id', verifyToken, supplierPaymentController.updatePayment);
router.delete('/:id',verifyToken, supplierPaymentController.deletePayment);

module.exports = router;
