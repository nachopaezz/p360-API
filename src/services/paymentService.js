const PaymentRequest = require('../models/PaymentRequest');
const axios = require('axios');
const moment = require('moment');
require('moment/locale/es');
const { API_TOKEN, API_BASE_URL } = require('../config/constants');

const createPayment = async (paymentData) => {
  try {
       // Fecha actual como fecha mínima
      const minDate = moment().startOf('day');
      const requestDate = moment(paymentData.first_due_date);

      // Validar que la fecha proporcionada sea posterior a la mínima
      if (requestDate.isSameOrBefore(minDate)) {
          throw new Error(`La fecha de vencimiento debe ser posterior a ${minDate.format('DD/MM/YYYY')}`);
      }

      // Formatear la fecha en formato dd-mm-yyyy como requiere la API
      const formattedDate = requestDate.format('DD-MM-YYYY');

      const requestData = {
          payment_request: {
              description: paymentData.description.substring(0, 500),
              first_due_date: formattedDate,
              first_total: Number(paymentData.first_total).toFixed(2),
              payer_name: paymentData.payer_name.substring(0, 255)
          }
      };

      console.log('Request a enviar a Pagos360:', JSON.stringify(requestData, null, 2));

      const pagos360Response = await axios.post(
          `${API_BASE_URL}/payment-request`,
          requestData,
          {
              headers: {
                  'Authorization': `Bearer ${API_TOKEN}`,
                  'Content-Type': 'application/json'
              }
          }
      );


        // Crear el registro en nuestra base de datos
        const payment = await PaymentRequest.create({
          description: paymentData.description,
          first_due_date: paymentData.first_due_date,
          first_total: paymentData.first_total,
          payer_name: paymentData.payer_name,
          external_reference: pagos360Response.data.id.toString(),
          checkout_url: pagos360Response.data.checkout_url,
          status: pagos360Response.data.state || 'pending'
      });

      console.log('Pago guardado en BD:', payment);

      return {
          id: payment.id,
          external_reference: payment.external_reference,
          description: payment.description,
          first_due_date: payment.first_due_date,
          first_total: payment.first_total,
          payer_name: payment.payer_name,
          checkout_url: payment.checkout_url,
          status: payment.status,
          created_at: payment.createdAt
      };

  } catch (error) {
      console.log('Error completo:', error);

      if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Headers:', error.response.headers);
          console.log('Data:', JSON.stringify(error.response.data, null, 2));

          // Si hay errores específicos en la respuesta
          if (error.response.data.errors) {
              const errorDetails = JSON.stringify(error.response.data.errors, null, 2);
              throw new Error(`Error de validación: ${errorDetails}`);
          }

          throw new Error(`Error de Pagos360: ${error.response.data.message}`);
      }

      throw error;
  }
};

// Listar pagos con paginación
const listPayments = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        const payments = await PaymentRequest.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            payments: payments.rows,
            total: payments.count,
            currentPage: page,
            totalPages: Math.ceil(payments.count / limit)
        };
    } catch (error) {
        throw new Error(`Error al listar los pagos: ${error.message}`);
    }
};


const getPaymentById = async (id) => {
    try {
        const payment = await PaymentRequest.findByPk(id);
        return payment;
    } catch (error) {
        throw new Error(`Error al obtener el pago: ${error.message}`);
    }
};

module.exports = {
    createPayment,
    listPayments,
    getPaymentById
};