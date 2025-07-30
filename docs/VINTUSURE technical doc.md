# VintuSure Insurance Management System

## Tech Stack (Golden Path)

### Frontend
- React + Vite
- TypeScript
- TanStack Query for data management
- React Router for navigation
- Tailwind CSS + shadcn/ui for styling
- Firebase SDK for authentication and data access

### Backend
- Firebase
  - Authentication
  - Firestore
  - Storage
  - Functions
  - Hosting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication related components
│   ├── claims/         # Claims management components
│   ├── customers/      # Customer management components
│   ├── dashboard/      # Dashboard layout components
│   ├── documents/      # Document handling components
│   ├── policies/       # Policy management components
│   ├── premium/        # Premium calculation components
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── lib/               # Utility functions and services
│   ├── firebase/      # Firebase configuration
│   ├── services/      # Service layer for data access
│   ├── utils.ts       # General utilities
│   └── validations/   # Zod schemas
├── routes/            # Route components
│   ├── auth/          # Authentication routes
│   └── dashboard/     # Dashboard routes
├── types/             # TypeScript type definitions
└── main.tsx          # Application entry point

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# App Configuration
VITE_APP_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. For Firebase emulator development:
```bash
npm run dev:emulator
```

## Build and Deployment

1. Build the application:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

3. Deploy to Firebase:
```bash
firebase deploy
```

## Key Features

### Authentication
- Email/password authentication
- Password reset
- Protected routes
- Role-based access control

### Policy Management
- Create, read, update policies
- Premium calculation
- Document attachments
- Policy status tracking

### Claims Management
- Submit claims
- Track claim status
- Document attachments
- Claim review process

### Customer Management
- Customer profiles
- Policy history
- Contact information

### Document Management
- Upload/download documents
- Document type categorization
- Storage in Firebase Storage

## Data Models

### Policy
```typescript
interface Policy {
    id: string
    type: 'comprehensive' | 'third_party'
    status: 'active' | 'expired' | 'cancelled' | 'pending'
    customerId: string
    policyNumber: string
    vehicle: {
        registrationNumber: string
        make: string
        model: string
        year: number
        engineNumber: string
        chassisNumber: string
        value: number
        usage: 'private' | 'commercial'
    }
    startDate: Date
    endDate: Date
    premium: {
        amount: number
        currency: string
        paymentStatus: 'pending' | 'paid' | 'partial'
        paymentMethod: string
    }
    createdAt: Date
    updatedAt: Date
    createdBy: string
}
```

### Customer
```typescript
interface Customer {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: {
        street: string
        city: string
        province: string
        postalCode: string
    }
    status: 'active' | 'inactive'
    createdAt: Date
    updatedAt: Date
    createdBy: string
}
```

### Claim
```typescript
interface Claim {
    id: string
    policyId: string
    customerId: string
    type: string
    description: string
    amount: number
    status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected'
    documents: Array<{
        id: string
        type: string
        url: string
        uploadedAt: Date
    }>
    createdAt: Date
    updatedAt: Date
    createdBy: string
}
```

## State Management

- React Context for authentication state
- TanStack Query for server state management
- React Hook Form for form state
- Local state with useState where appropriate

## Error Handling

- Global error boundary for React errors
- Form validation with Zod
- Toast notifications for user feedback
- Proper error handling in Firebase operations

## Testing

- Component testing with React Testing Library
- Form validation testing
- Service layer testing
- Integration testing with Firebase emulators

## Performance Considerations

- Code splitting with React.lazy
- Proper indexing in Firestore
- Image optimization
- Caching with TanStack Query
- Lazy loading of routes

## Security

- Firebase Authentication
- Firestore security rules
- Protected routes
- Input validation
- Secure file uploads
- Environment variables

## Accessibility

- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support
- Focus management

## Future Improvements

1. Add more comprehensive testing
2. Implement real-time updates
3. Add offline support
4. Enhance performance monitoring
5. Add more analytics
6. Implement CI/CD pipeline

   
