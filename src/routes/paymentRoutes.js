const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validateApiToken } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(validateApiToken);

// Rutas para payment-request
router.post('/payment-request', paymentController.createPaymentRequest);
router.get('/payment-request', paymentController.listPayments);
router.get('/payment-request/:id', paymentController.getPaymentById);

// Ruta para procesamiento en batch
router.post('/batch-payments', paymentController.processBatchPayments);

module.exports = router;