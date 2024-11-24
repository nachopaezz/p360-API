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

        // Validación de campos requeridos
        const requiredFields = ['description', 'first_due_date', 'first_total', 'payer_name'];
        const missingFields = requiredFields.filter(field => !paymentRequestData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
            });
        }

        const result = await PaymentService.createPayment(paymentRequestData);
        res.status(201).json(result);

    } catch (error) {
        console.log('Error en el controlador:', error);
        if (error.message.includes('Error de Pagos360')) {
            return res.status(422).json({
                error: error.message
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

        if (!Array.isArray(payments)) {
            return res.status(400).json({
                error: 'El campo payments debe ser un array'
            });
        }

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

// Obtener pago por ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'El ID del pago es requerido'
            });
        }

        console.log('Obteniendo pago con ID:', id);

        const payment = await PaymentService.getPaymentById(id);

        if (!payment) {
            return res.status(404).json({
                error: 'Pago no encontrado'
            });
        }

        res.status(200).json(payment);

    } catch (error) {
        console.log('Error al obtener el pago por ID:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};


module.exports = {
    createPaymentRequest,
    processBatchPayments,
    listPayments,
    getPaymentById
};