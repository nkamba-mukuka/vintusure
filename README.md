# VintuSure Insurance Management System

A modern Motor Third Party Insurance management system built with Vite, React, and Firebase.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

For development with Firebase emulators:

```bash
npm run dev:emulator
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- React + TypeScript for type-safe development
- Firebase Authentication
- Firestore for data storage
- Firebase Storage for file uploads
- Firebase Functions for backend logic
- TanStack Query for data management
- React Router for navigation
- Tailwind CSS + shadcn/ui for styling
- Vite for fast development and optimized builds

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and services
├── routes/        # Route components
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

## Deployment

Build the application:

```bash
npm run build
```

Deploy to Firebase:

```bash
npm run deploy
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Learn More

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
