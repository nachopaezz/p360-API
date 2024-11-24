
# API de Gestión de Pagos

API REST desarrollada en Node.js para gestionar solicitudes de pago individuales y en lote, con seguimiento de estados mediante webhooks.

## 🚀 Características

- Creación de solicitudes de pago individuales
- Procesamiento de pagos en lote (hasta 5 concurrentes)
- Sistema de reintentos automáticos
- Webhook para actualización de estados
- Historial de cambios de estado
- Listado paginado de solicitudes

## 🛠 Tecnologías

- Node.js
- Express
- Sequelize ORM
- MySQL
- JSON Web Tokens

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL
- npm o yarn

## 🔧 Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install` o `yarn install`
3. Configurar variables de entorno en el archivo `.env`
4. Iniciar la aplicación en modo desarrollo:

```bash
Opción 1: npm run dev
Opcion 2: nodemon src/index.js

# Ambos comandos hacen lo mismo: inician el servidor en modo desarrollo
# con recarga automática cuando se detectan cambios en el código
```

## 📚 Documentación API

#### Crear Pago
```
<<<<<<< HEAD
POST /api/payment-requests
=======
POST /api/payment-request
>>>>>>> master
Content-Type: application/json

{
    "payment_request":  {
        "description":  "Pago TEST 2",
        "first_due_date":  "2024-11-25",
        "first_total":  2999.00,
        "payer_name":  "Nacho Test"
    }
}
```

#### Listar Pagos
```
<<<<<<< HEAD
GET /api/payment-requests?page=1&limit=10
=======
GET /api/payment-request?page=1&limit=10
```

#### Obtener Pago por ID
```
GET /api/payment-request/:id
>>>>>>> master
```

#### Pagos en Lote

```
POST /api/batch-payments
Content-Type: application/json

{
    "payments":  [
        {
            "payment_request":  {
                "description":  "Pago Lote 1",
                "first_due_date":  "2024-11-26",
                "first_total":  1999.00,
                "payer_name":  "Cliente 1"
            }
        },
        {
            "payment_request":  {
                "description":  "Pago Lote 2",
                "first_due_date":  "2024-11-26",
                "first_total":  2999.00,
                "payer_name":  "Cliente 2"
            }
        }
    ],
    "allowRetries":  true
}
```

### Webhook
```
POST /api/webhook/payment-status
X-Webhook-Token: [tu-token]
Content-Type: application/json

{
    "payment_id": "payment_id",
    "new_status": "paid"
}
```

<<<<<<< HEAD
=======
#### Obtener historial de un Pago por ID
```
GET /api/webhook/payment-status/:payment_id/history
```

>>>>>>> master
### Respuestas

#### Crear Pago - Respuesta Exitosa
```json
{
    "message": "Solicitud de pago creada exitosamente",
    "payment": {
        "id": "uuid",
        "status": "pending",
        "checkout_url": "url_de_pago"
    }
}
```

#### Webhook - Respuesta Exitosa
```json
{
    "message": "Estado actualizado correctamente",
    "payment_id": "uuid",
    "previous_status": "pending",
    "new_status": "paid"
}
```

#### Respuestas de Error
```json
{
    "error": "Descripción del error"
}
```

## 🔐 Seguridad

- Autenticación mediante tokens en headers
- Validación de datos de entrada
- Manejo de errores HTTP
- Transacciones seguras en base de datos

## 🗄️ Base de Datos

### Tablas Principales

-  `PaymentRequests`: Almacena las solicitudes de pago
-  `PaymentStatusHistories`: Registra el historial de cambios de estado

## 📝 Notas

- Los pagos en lote se procesan en grupos de 5 solicitudes concurrentes
- Sistema de reintentos: máximo 3 intentos con 1 minuto entre cada uno
- Estados de pago: pending,  paid, reverted, expired y refunded

- Transiciones permitidas:
```
pending → paid
<<<<<<< HEAD
paid → reversed
```
- Transiciones NO permitidas:
```
pending → reversed
paid → pending
reversed → paid
reversed → pending
=======
paid → reverted
```
- Transiciones NO permitidas:
```
pending → reverted
paid → pending
reverted → paid
reverted → pending
>>>>>>> master
```