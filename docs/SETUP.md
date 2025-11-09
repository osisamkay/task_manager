# InvoiceCanada - Setup Guide

This guide will help you set up the InvoiceCanada project locally.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoicecanada
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb invoicecanada
```

### 4. Configure Environment Variables

#### Server (.env)

Create `server/.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/invoicecanada"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

#### Client (.env)

Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Run Database Migrations

```bash
cd server
npx prisma migrate dev
```

### 6. Seed Database (Optional)

Load demo data:

```bash
npm run prisma:seed
```

This creates a demo account:
- Email: `demo@invoicecanada.com`
- Password: `password123`

### 7. Start Development Servers

From the root directory:

```bash
# Start both frontend and backend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Prisma Studio (Database GUI)

View and manage your database:

```bash
cd server
npx prisma studio
```

Access at: http://localhost:5555

## Troubleshooting

### Port Already in Use

If port 5000 or 5173 is in use:

```bash
# Change PORT in server/.env
PORT=3000

# Vite will automatically use another port for frontend
```

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in server/.env
- Ensure database exists: `psql -l`

### Prisma Migration Errors

Reset database and migrations:

```bash
cd server
npx prisma migrate reset
```

## Next Steps

- Review the [PRD](PRD.md) for product requirements
- Check [API Documentation](API.md) for endpoint details
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.
