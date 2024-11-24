const { API_TOKEN } = require('../config/constants');

const validateApiToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Token no proporcionado o formato inválido'
            });
        }

        const token = authHeader.split(' ')[1];

        if (token !== API_TOKEN) {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }

        next();
    } catch (error) {
        res.status(401).json({
            error: 'Error de autenticación'
        });
    }
};

// Middleware para webhooks
const validateWebhookToken = (req, res, next) => {
    const token = req.headers['x-webhook-token'];

    if (!token || token !== API_TOKEN) {
        return res.status(401).json({
            error: 'Token de webhook inválido o no proporcionado'
        });
    }

    next();
};

module.exports = {
    validateApiToken,
    validateWebhookToken
};