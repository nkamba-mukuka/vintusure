# VintuSure Insurance Management System - TODO List

## Completed ✅
1. Project Setup
   - [x] Initialize Vite + React project
   - [x] Configure TypeScript
   - [x] Set up Tailwind CSS + shadcn/ui
   - [x] Configure Firebase
   - [x] Set up React Router
   - [x] Configure TanStack Query
   - [x] Set up development environment

2. Authentication
   - [x] Implement email/password auth
   - [x] Add password reset
   - [x] Set up protected routes with React Router
   - [x] Add auth context
   - [x] Add toast notifications

3. Policy Management
   - [x] Create policy form with React Hook Form + Zod
   - [x] Implement policy list with TanStack Query
   - [x] Add policy details view
   - [x] Add policy document upload
   - [x] Implement premium calculator

4. Customer Management
   - [x] Create customer form
   - [x] Implement customer list
   - [x] Add customer details view
   - [x] Add customer search

5. Claims Management
   - [x] Create claim form
   - [x] Implement claim list
   - [x] Add claim details view
   - [x] Add claim document upload

6. Document Management
   - [x] Set up Firebase Storage
   - [x] Implement document upload
   - [x] Add document type categorization
   - [x] Add document list view

## In Progress 🚧
1. Testing
   - [ ] Set up Vitest environment
   - [ ] Add React Testing Library component tests
   - [ ] Add service tests
   - [ ] Add integration tests

2. Performance
   - [ ] Implement proper Firestore indexing
   - [ ] Add data pagination with TanStack Query
   - [ ] Optimize image uploads
   - [ ] Add caching strategies

3. Security
   - [ ] Set up Firestore security rules
   - [ ] Add input sanitization
   - [ ] Implement file upload restrictions
   - [ ] Add rate limiting
   - [ ] Implement Firebase Auth for Cloud Functions
   - [ ] Add API key authentication for external services
   - [ ] Set up rate limiting for Cloud Functions
   - [ ] Implement request validation middleware
   - [ ] Add IP whitelisting for sensitive endpoints
   - [ ] Set up monitoring for suspicious activities

## Upcoming 📅
1. Features
   - [ ] Add real-time updates with Firebase
   - [ ] Implement offline support
   - [ ] Add bulk operations
   - [ ] Add export functionality

2. UI/UX
   - [ ] Add dark mode with Tailwind
   - [ ] Improve mobile responsiveness
   - [ ] Add more animations
   - [ ] Improve error messages

3. DevOps
   - [ ] Set up CI/CD pipeline with Vite build
   - [ ] Add automated testing
   - [ ] Configure production monitoring
   - [ ] Add error tracking

4. Documentation
   - [ ] Add API documentation
   - [ ] Create user guide
   - [ ] Add component documentation
   - [ ] Create deployment guide
   - [ ] Document security best practices and configurations

## Notes
- Successfully migrated to Vite + React
- Using React Router for client-side routing
- Firebase integration working with emulators
- Form validation using Zod implemented
- Toast notifications added for better UX
- Cloud Functions deployed with basic setup

## Known Issues
1. Performance
   - Large policy lists need pagination with TanStack Query
   - Image uploads need optimization
   - Some components need memoization

2. UX
   - Form error messages need improvement
   - Loading states could be more consistent
   - Mobile navigation needs refinement

3. Technical Debt
   - Some components need better type definitions
   - Error handling could be more consistent
   - Test coverage needs improvement with Vitest
   - Cloud Functions need proper security implementation

## Next Steps
1. Immediate
   - Add missing Vitest tests
   - Improve error handling
   - Optimize data fetching with TanStack Query
   - Add proper documentation

2. Short Term
   - Implement real-time updates with Firebase
   - Add offline support
   - Improve mobile experience
   - Add dark mode with Tailwind
   - Implement Cloud Functions security measures

3. Long Term
   - Set up CI/CD with Vite build
   - Add analytics
   - Implement monitoring
   - Add automated testing with Vitest and Playwright
   - Set up comprehensive security monitoring

# 🚀 VintuSure AI Insurance System Milestones

## Milestone 1: Landing Page Development ✅
**Objective**: Implement the VintuSure landing page (vintusure.com) with clear navigation for agents and customers.

### Tasks:
- [x] Update the landing page UI, where there is a white background put a blurred background, resembling apple's liquid glass.
- [x] Implement "I'm an Agent" button linking to /login (login page) if the current user is not authenticated, but if authenticated just show a dashboard button.
- [x] Implement "I'm a Customer" button linking to /explore (external tools).

## Milestone 2: Internal Use (Agent & Employee) System Development ✅
**Objective**: Develop the secure internal system for insurance agents and employees with full access and AI assistance.

### Tasks:
- [x] Make sure that every route/page requires a user to be authenticated to access the links/pages.
- [x] Develop full visibility features for customer profiles in the customer folder in the components directory, policies as well in the policies folder in the components directory, claims in the claims folder in the components directory, and any other data sensitive data and make sure that a user can only access data that corresponds with their userId.
- [x] Integrate context-aware AI assistant for agents (e.g., "Need help creating a claim?" pops up on the claims page in the claims folder in the components directory).
- [x] Implement AI functionality to answer agent-specific questions (e.g., "When is Mukuka Nkamba's policy expiring?") implement this on the dashboard page in the dashboard.tsx file in the dashboard folder in the components directory, keep the topbar and sidebar components.
- [x] Develop features for agents to update records, process claims, and manage policies.
- [x] Integrate friendly tabs that show helpful suggestions of the important and vital tasks like creating policies e.t.c, implement this on the dashboard as well.
- [x] Build a comprehensive dashboard including all tools needed for day-to-day insurance operations.

## Milestone 3: External Use (Customer & Visitor) System Development ✅
**Objective**: Create a prompt and read-only external platform for customers and potential clients to browse information and connect with agents.

### Tasks:
- [x] Set up /explore or /public routes with no login required. Create an explore.tsx component that uses the already existing RAG functionality.
- [x] Develop sections for browsing insurance product info, FAQs, and general policy overviews.
- [x] Ensure no access to download sensitive documents or quotes.
- [x] Implement display of agent contact information (Name, Phone number 📞, Email ✉️, Location map 🗺️) for customer inquiries.
- [x] Integrate a general AI assistant for product-related questions, without access to personal data(use the existing RAG functionality here as well).
- [x] Design a simple, clean UI focused on educating and connecting customers to agents.

## Milestone 4: System Security & Efficiency Review ✅
**Objective**: Ensure the system adheres to security protocols, maintains efficiency, and provides a user-friendly experience for both internal and external users.

### Tasks:
- [x] Conduct a security audit to confirm sensitive data remains internal.
- [x] Evaluate system efficiency, ensuring agents have full tools and customers get easy information.
- [x] Review user-friendliness, verifying tailored AI help for agents and simple guidance for customers.