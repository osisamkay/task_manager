# InvoiceCanada API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication

### Register
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "businessName": "My Company",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### Get Profile
```
GET /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Update Profile
```
PUT /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "businessName": "Updated Company",
  "businessNumber": "123456789RT0001",
  "province": "ON",
  ...
}
```

## Clients

### Get All Clients
```
GET /clients?search=term&province=ON
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...]
}
```

### Get Single Client
```
GET /clients/:id
```

### Create Client
```
POST /clients
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "businessName": "Smith & Co",
  "province": "ON",
  "paymentTerms": 30
}
```

### Update Client
```
PUT /clients/:id
```

### Delete Client
```
DELETE /clients/:id
```

## Invoices

### Get All Invoices
```
GET /invoices?status=SENT&paymentStatus=UNPAID&clientId=xxx
```

### Get Single Invoice
```
GET /invoices/:id
```

### Create Invoice
```
POST /invoices
```

**Request Body:**
```json
{
  "clientId": "client-id",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-31",
  "province": "ON",
  "items": [
    {
      "description": "Web Development",
      "quantity": 10,
      "rate": 10000,
      "taxExempt": false
    }
  ],
  "notes": "Payment due in 30 days"
}
```

**Note:** `rate` and amounts are in cents (e.g., 10000 = $100.00)

### Update Invoice
```
PUT /invoices/:id
```

### Delete Invoice
```
DELETE /invoices/:id
```

### Add Payment
```
POST /invoices/:id/payments
```

**Request Body:**
```json
{
  "amount": 10000,
  "paidAt": "2024-01-15",
  "method": "E-Transfer",
  "reference": "REF-123"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
