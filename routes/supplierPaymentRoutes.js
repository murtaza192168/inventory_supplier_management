const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/supplierPaymentController');

router.post('/', paymentController.addPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:supplierId', paymentController.getPaymentsBySupplier);
router.patch('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
