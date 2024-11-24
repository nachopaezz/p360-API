const PaymentService = require('./paymentService');

const CONFIG = {
    BATCH_SIZE: 5,
    MAX_RETRIES: 3,
    RETRY_DELAY: 60000, // 1 minuto
};

// Procesar un pago individual con reintentos
const processPayment = async (paymentData, allowRetries) => {
    // Validar datos de entrada
    if (!paymentData || typeof paymentData !== 'object') {
        throw new Error('Datos de pago inválidos');
    }

    let attempts = 0;
    const maxAttempts = allowRetries ? CONFIG.MAX_RETRIES : 1;

    while (attempts < maxAttempts) {
        try {
            console.log(`Intento ${attempts + 1}/${maxAttempts} para pago:`, paymentData.description);
            const payment = await PaymentService.createPayment(paymentData);
            console.log(`Pago procesado exitosamente:`, payment.id);
            return {
                success: true,
                payment,
                attempts: attempts + 1
            };
        } catch (error) {
            attempts++;
            console.error(`Error en intento ${attempts}:`, error.message);

            if (attempts < maxAttempts) {
                console.log(`Esperando ${CONFIG.RETRY_DELAY/1000} segundos antes de reintentar...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            } else {
                return {
                    success: false,
                    error: error.message,
                    attempts
                };
            }
        }
    }
};

// Formatear resultados del procesamiento por lotes
const formatResults = (results) => {
    return {
        successful: results.filter(r => r.value?.success).length,
        failed: results.filter(r => !r.value?.success).length,
        details: results.map(r => ({
            success: r.value?.success || false,
            attempts: r.value?.attempts || 0,
            error: r.value?.error,
            payment: r.value?.payment
        }))
    };
};

// Procesar lote de pagos
const processBatch = async (payments, allowRetries = false) => {
  // Validaciones iniciales
  if (!Array.isArray(payments)) {
      throw new Error('El parámetro payments debe ser un array');
  }

  if (payments.length === 0) {
      return {
          successful: 0,
          failed: 0,
          details: []
      };
  }

  console.log(`Iniciando procesamiento de ${payments.length} pagos en lotes de ${CONFIG.BATCH_SIZE}`);
  const results = [];

  // Procesar pagos en lotes
  for (let i = 0; i < payments.length; i += CONFIG.BATCH_SIZE) {
      const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(payments.length / CONFIG.BATCH_SIZE);

      console.log(`Procesando lote ${batchNumber}/${totalBatches}`);

      const batch = payments.slice(i, i + CONFIG.BATCH_SIZE);
      // Extraer payment_request de cada elemento
      const batchPromises = batch.map(item => {
          if (!item.payment_request) {
              throw new Error('Cada elemento debe contener un objeto payment_request');
          }
          return processPayment(item.payment_request, allowRetries);
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      console.log(`Lote ${batchNumber} completado`);
  }

  const formattedResults = formatResults(results);
  console.log('Resumen del procesamiento:', formattedResults);
  return formattedResults;
};

module.exports = {
    processBatch,
    processPayment,
    formatResults,
    CONFIG
};