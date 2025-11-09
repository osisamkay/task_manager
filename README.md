# InvoiceCanada 🍁

Professional Invoice Generator with Canadian Tax Support

## Overview

InvoiceCanada is a micro-SaaS product designed specifically for Canadian contractors, freelancers, and small businesses to create professional invoices with accurate Canadian tax calculations (GST/PST/HST/QST).

## Key Features

- ✅ Automatic Canadian tax calculations (GST, PST, HST, QST)
- ✅ Professional invoice templates
- ✅ Client management
- ✅ PDF generation
- ✅ Payment tracking
- ✅ Recurring invoices
- ✅ Multi-user support

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React-PDF
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

### Infrastructure
- Railway/Render
- Cloudflare CDN
- AWS S3

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd invoicecanada
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the server directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/invoicecanada"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

4. Run database migrations
```bash
cd server
npx prisma migrate dev
```

5. Start development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
invoicecanada/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript types
│   └── prisma/          # Database schema
└── docs/                # Documentation

```

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@invoicecanada.com or create an issue in the GitHub repository.

## Roadmap

See the [Product Requirements Document](docs/PRD.md) for detailed feature roadmap and milestones.
