const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validateWebhookToken } = require('../middlewares/authMiddleware');

// Ruta para webhooks con su propia validación
router.post('/payment-status', validateWebhookToken, webhookController.updatePaymentStatus);

// Ruta para obtener historial de pago
router.get('/payment-status/:payment_id/history', validateWebhookToken, webhookController.getPaymentHistory);


module.exports = router;