const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validateApiToken } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(validateApiToken);

// Rutas para pagos individuales
router.post('/payment-requests', paymentController.createPaymentRequest);
router.get('/payment-requests', paymentController.listPayments);

// Ruta para procesamiento en batch
router.post('/batch-payments', paymentController.processBatchPayments);

module.exports = router;