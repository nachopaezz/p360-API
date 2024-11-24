const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentStatusHistory = sequelize.define('PaymentStatusHistory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    payment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'PaymentRequests',
            key: 'id'
        }
    },
    previous_status: {
        type: DataTypes.ENUM('pending', 'paid', 'reverted', 'expired', 'refunded'),
        allowNull: false
    },
    new_status: {
        type: DataTypes.ENUM('pending', 'paid', 'reverted', 'expired', 'refunded'),
        allowNull: false
    },
    changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'PaymentStatusHistories',
    timestamps: true
});

module.exports = PaymentStatusHistory;