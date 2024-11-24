const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentRequest = sequelize.define('PaymentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción no puede estar vacía'
      },
      len: {
        args: [3, 255],
        msg: 'La descripción debe tener entre 3 y 255 caracteres'
      }
    }
  },
  first_due_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'La fecha debe ser válida'
      },
      isAfter: {
        args: new Date().toISOString(),
        msg: 'La fecha de vencimiento debe ser posterior a la fecha actual'
      }
    }
  },
  first_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El monto debe ser un número decimal válido'
      },
      min: {
        args: [0.01],
        msg: 'El monto debe ser mayor a 0'
      }
    }
  },
  payer_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del pagador no puede estar vacío'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre del pagador debe tener entre 2 y 100 caracteres'
      }
    }
  },
  checkout_url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: {
        msg: 'La URL de checkout debe ser una URL válida'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'reverted', 'expired', 'refunded'),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'paid', 'reverted', 'expired', 'refunded']],
        msg: 'El estado debe ser: pending, paid, reverted, expired o reverted'
      }
    }
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true
    }
  },
  external_reference: {
    type: DataTypes.STRING,
    allowNull: false
 }
});

module.exports = PaymentRequest;