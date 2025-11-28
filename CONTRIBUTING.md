# Contributing to BrainFlow

Thank you for your interest in contributing to BrainFlow! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Docker version, etc.)
- **Error logs** or console output

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- **Clear description** of the feature
- **Use case** - why is this feature needed?
- **Proposed solution** - how should it work?
- **Alternatives considered** - other approaches you've thought about

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our code style guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages** following our commit conventions
6. **Submit a pull request** with a clear description

## 🛠 Development Setup

### Prerequisites

- Bun v1.0.0+
- Node.js v18+
- PostgreSQL v14+
- Docker (optional)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/brainflow.git
cd brainflow

# Install dependencies
cd frontend && bun install && cd ..
cd backend && bun install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start database
cd docker && docker compose up -d postgres && cd ..

# Run migrations
cd frontend && bunx prisma db push && cd ..

# Start development servers
bun run dev:frontend  # Terminal 1
bun run dev:backend   # Terminal 2
```

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for type safety
- Follow **ESLint** rules (run `bun run lint`)
- Use **async/await** instead of callbacks
- Prefer **const** over **let**, avoid **var**
- Use **meaningful variable names**

### React/Next.js

- Use **functional components** with hooks
- Prefer **Server Components** when possible
- Use **"use client"** directive only when needed
- Keep components **small and focused**
- Extract reusable logic into **custom hooks**

### Database

- Use **Prisma** for all database operations
- Never write raw SQL unless absolutely necessary
- Always use **transactions** for multi-step operations
- Add **indexes** for frequently queried fields

### File Naming

- Components: `PascalCase.tsx` (e.g., `TeamCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- API routes: `route.ts` (Next.js convention)
- Pages: `page.tsx` (Next.js convention)

## 📋 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(teams): add team invite code generation
fix(auth): resolve Google OAuth redirect issue
docs(readme): update installation instructions
refactor(api): simplify team join logic
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend && bun test

# Backend tests
cd backend && bun test
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for meaningful test coverage
- Test edge cases and error scenarios

## 🔍 Code Review Process

1. **Automated checks** must pass (linting, type checking)
2. **At least one maintainer** must approve
3. **All comments** must be resolved
4. **No merge conflicts** with main branch
5. **Documentation** must be updated if needed

## 📚 Documentation

When adding new features:

- Update **README.md** if it affects setup or usage
- Add **inline comments** for complex logic
- Update **API documentation** for new endpoints
- Add **examples** where helpful

## 🎯 Priority Areas

We're especially interested in contributions for:

- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Accessibility improvements**
- **Test coverage** expansion
- **Documentation** enhancements
- **UI/UX improvements**

## ❓ Questions?

- Check existing [Issues](https://github.com/your-username/brainflow/issues)
- Create a new issue with the `question` label
- Reach out to maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BrainFlow! 🎉

