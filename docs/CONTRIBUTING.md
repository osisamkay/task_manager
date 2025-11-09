# Contributing to InvoiceCanada

Thank you for your interest in contributing to InvoiceCanada!

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting
5. Commit with descriptive messages
6. Push to your fork
7. Create a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Use meaningful variable and function names

### Code Style

- Use ESLint and Prettier
- 2 spaces for indentation
- Use single quotes for strings
- Add comments for complex logic

### Git Commits

Follow conventional commits:

```
feat: add Canadian tax calculation
fix: resolve invoice total calculation bug
docs: update API documentation
style: format code with prettier
refactor: simplify auth middleware
test: add client API tests
```

## Project Structure

```
invoicecanada/
├── server/           # Backend (Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   └── prisma/
├── client/           # Frontend (React + TypeScript)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── stores/
└── docs/             # Documentation
```

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## Database Changes

When modifying the database schema:

1. Update `server/prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name description`
3. Update seed file if needed
4. Test migrations on a fresh database

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Update documentation as needed
- Add tests for new features
- Ensure CI passes
- Request review from maintainers

## Questions?

Open an issue for questions or discussions!
