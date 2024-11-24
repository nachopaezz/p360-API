const PaymentRequest = require('../models/PaymentRequest');
const PaymentStatusHistory = require('../models/PaymentStatusHistory');
const sequelize = require('../config/database');

const updatePaymentStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { payment_id, new_status } = req.body;

        // Validar estado
        const validStates = ['paid', 'reverted', 'expired', 'refunded'];
        if (!validStates.includes(new_status)) {
            throw new Error('Estado inválido. Debe ser: paid, reverted, expired o refunded');
        }

        // Buscar el pago
        const payment = await PaymentRequest.findByPk(payment_id);
        if (!payment) {
            throw new Error('Pago no encontrado');
        }

        // Validar transición de estado
        const validTransitions = {
            'pending': ['paid', 'expired'],     // pending puede pasar a paid o expired
            'paid': ['reverted', 'refunded'],   // paid puede pasar a reverted o refunded
            'expired': ['paid'],                // expired puede pasar a paid (caso excepcional)
            'reverted': [],                     // reverted es estado final
            'refunded': []                      // refunded es estado final
        };

        if (!validTransitions[payment.status]?.includes(new_status)) {
            throw new Error(`Transición inválida de ${payment.status} a ${new_status}`);
        }

        // Guardar historial de cambio
        await PaymentStatusHistory.create({
            payment_id: payment.id,
            previous_status: payment.status,
            new_status,
            changed_at: new Date()
        }, { transaction });

        // Actualizar estado del pago
        const previousStatus = payment.status;
        payment.status = new_status;
        await payment.save({ transaction });

        await transaction.commit();

        console.log(`Estado de pago actualizado: ${payment_id} de ${previousStatus} a ${new_status}`);

        res.status(200).json({
            message: 'Estado actualizado correctamente',
            payment_id,
            previous_status: previousStatus,
            new_status,
            history_record: {
                changed_at: new Date()
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error en webhook:', error);

        res.status(400).json({
            error: error.message
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const { payment_id } = req.params;

        const history = await PaymentStatusHistory.findAll({
            where: { payment_id },
            order: [['changed_at', 'DESC']]
        });

        res.status(200).json({
            payment_id,
            history
        });

    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(400).json({
            error: error.message
        });
    }
};

module.exports = {
    updatePaymentStatus,
    getPaymentHistory
};