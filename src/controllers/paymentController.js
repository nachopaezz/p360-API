const PaymentService = require('../services/paymentService');
const BatchProcessingService = require('../services/batchProcessingService');

// Crear solicitud de pago
const createPaymentRequest = async (req, res) => {
  try {
      const paymentRequestData = req.body.payment_request;

      if (!paymentRequestData) {
          return res.status(400).json({
              error: 'El objeto payment_request es requerido'
          });
      }

      // Validación básica de campos requeridos
      const requiredFields = ['description', 'first_due_date', 'first_total', 'payer_name'];
      const missingFields = requiredFields.filter(field => !paymentRequestData[field]);

      if (missingFields.length > 0) {
          return res.status(400).json({
              error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
          });
      }

      const paymentData = {
          description: paymentRequestData.description,
          first_due_date: paymentRequestData.first_due_date,
          first_total: parseFloat(paymentRequestData.first_total),
          payer_name: paymentRequestData.payer_name
      };

      console.log('Datos recibidos:', paymentData);

      const result = await PaymentService.createPayment(paymentData);
      res.status(201).json(result);

  } catch (error) {
      console.log('Error en el controlador:', error);

      if (error.message.includes('Error de validación')) {
          return res.status(400).json({
              error: error.message,
              details: error.response?.data?.errors || {}
          });
      }

      if (error.message.includes('Error de Pagos360')) {
          return res.status(422).json({
              error: error.message,
              details: error.response?.data || {}
          });
      }

      res.status(500).json({
          error: 'Error interno del servidor',
          details: error.message
      });
  }
};

// Procesar pagos en lote
const processBatchPayments = async (req, res) => {
  try {
      const { payments, allowRetries = false } = req.body;

      // Validar estructura del request
      if (!Array.isArray(payments)) {
          return res.status(400).json({
              error: 'El campo payments debe ser un array'
          });
      }

      // Validar que cada elemento tenga la estructura correcta
      const invalidPayments = payments.filter(p => !p.payment_request);
      if (invalidPayments.length > 0) {
          return res.status(400).json({
              error: 'Cada elemento debe contener un objeto payment_request'
          });
      }

      const results = await BatchProcessingService.processBatch(payments, allowRetries);
      res.status(200).json(results);
  } catch (error) {
      console.error('Error en procesamiento por lotes:', error);
      res.status(400).json({ error: error.message });
  }
};

// Listar pagos
const listPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const payments = await PaymentService.listPayments(page, limit);
        res.status(200).json(payments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createPaymentRequest,
    processBatchPayments,
    listPayments
};