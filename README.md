# VintuSure Insurance Management System

An internal insurance platform with AI-powered document understanding to help agents and staff instantly find policy answers using RAG (Retrieval-Augmented Generation).

## What's inside?

This monorepo uses [PNPM](https://pnpm.io) as a package manager and [Turborepo](https://turbo.build/repo) as a build system.

### Apps and Packages

- `apps/web`: React + Vite frontend application
- `packages/shared`: Shared types and validation schemas
- `packages/seeding`: Firestore seeding scripts
- `packages/rag`: VintuSure AI components
- `functions`: Firebase Cloud Functions & tRPC API
- `docs`: Documentation

### Build

To build all apps and packages, run the following command:

```bash
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```bash
pnpm dev
```

### Tech Stack

- **Runtime:** Node (Firebase Gen 2 Cloud Functions)
- **Language:** TypeScript (strict)
- **Front‑end:** React + Vite
- **UI kit:** shadcn/ui (Radix + Tailwind)
- **Styling:** Tailwind CSS
- **State / data fetching:** TanStack Query
- **Forms & validation:** React Hook Form + Zod
- **API layer:** tRPC
- **Backend services:** Firebase Auth · Firestore · Storage · Functions
- **RAG Integration:** VintuSure AI
- **Package manager:** PNPM workspaces
- **Build orchestration:** Turborepo

### Utilities

This monorepo has some additional tools:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/) for Git hooks
- [Commitlint](https://commitlint.js.org/) for commit message linting

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp apps/web/.env.example apps/web/.env
```

3. Start development server:
```bash
pnpm dev
```

## Documentation

- [Technical Documentation](./docs/TECHNICAL.md)
- [API Documentation](./docs/API.md)
- [Contributing Guide](./CONTRIBUTING.md)

## License

Private - For internal use only.
