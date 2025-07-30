// VintuSure Frontend Specification Document

// 1. AUTH & DASHBOARD PAGES

// Login Page
// - Firebase Auth integration (email/password)
// - Modern nude-themed UI with shadcn/ui inputs & buttons
// - Validation via React Hook Form + Zod
// - Redirect to /dashboard after login

// Dashboard Page
// - User greeting with role (Agent/Admin)
// - Display quick stats: Total Policies, Pending Claims, Documents Uploaded
// - Nude-toned card components (Tailwind: bg-stone-100, text-stone-800, etc.)
// - TanStack Query fetch for stats


// 2. CUSTOMER MANAGEMENT

// Customers Page (/customers)
// - List of customers with search + filters (e.g. by status)
// - Create new customer (modal or page)
// - Table with: Name, Email, Phone, Status, Actions
// - Edit/delete options with toast confirmations
// - Modern table with hover effects, alternating row colors

// Add/Edit Customer Page
// - Form with full name, NRC/passport, phone, email
// - React Hook Form + Zod
// - Success toast + redirect to customer list


// 3. POLICY ISSUANCE & MANAGEMENT

// Quote & Issue Policy Page (/policies/new)
// - Stepper UI: Customer → Vehicle → Quote → Issue
// - Vehicle fields: Make, Model, Reg No., Year, Engine No.
// - Auto-calculate premium using backend call
// - Confirm & Issue policy with summary card

// Policy List Page (/policies)
// - Search & filter by plate number, status, product type
// - Table with: Policy No., Customer, Vehicle, Status, Issue Date
// - View action opens policy detail modal/page

// Policy Detail Page (/policies/[id])
// - Show full policy info
// - Download policy doc (link to fileURL)
// - Cancel/Expire policy option (if role = Admin)


// 4. CLAIMS MANAGEMENT

// Claims List Page (/claims)
// - List of all claims
// - Filter by status: Submitted, Under Review, Paid
// - Table: Claim ID, Policy No., Type, Status, Filed Date

// New Claim Page (/claims/new)
// - Select Policy → Auto-fill customer/vehicle
// - Upload documents (uses Firebase Storage)
// - Add notes, incident description, attach photos

// Claim Detail Page (/claims/[id])
// - Timeline of status updates (shadcn/ui Tabs or Steps)
// - Claim decision section (approve/reject) with comments


// 5. DOCUMENT MANAGEMENT (Admin Only)

// Documents Page (/documents)
// - Upload PDF (form with metadata)
// - View uploaded documents, filter by type
// - Option to re-embed (triggers RAG ingestion)
// - Show embedding status & timestamp


// 6. COMMON COMPONENTS

// Navigation (Sidebar + Topbar)
// - Role-based nav visibility (Agent vs Admin)
// - Logo, links to Dashboard, Customers, Policies, Claims, Docs

// Theme
// - Use nude color palette (Tailwind base: stone, rose, zinc)
// - Soft shadows, rounded-xl, consistent spacing
// - Buttons: solid + outline, always legible (black text on light backgrounds)

// Modals
// - Shadcn/ui Dialog for confirmations, view-only overlays


// 7. STATE MANAGEMENT

// Use TanStack Query for:
// - Fetching customers, policies, claims
// - Mutations for create/update/delete
// - React Query Devtools enabled in dev


// 8. FORM HANDLING

// React Hook Form for all forms
// - Paired with Zod schemas for validation
// - Use shared Zod schemas from packages/shared


// 9. ACCESS CONTROL

// - Check user role (Agent vs Admin) from Firebase Auth token
// - Disable or hide buttons based on role (e.g., delete, upload)


// 10. RESPONSIVENESS

// - Mobile-friendly nav (collapsible sidebar)
// - Responsive tables and cards (stack on small screens)


// 11. TESTING & STORYBOOK

// - All components written with reusability
// - Add Storybook stories for form inputs, table row, policy card


// 12. FOLDER STRUCTURE (apps/web/src)

// ├── components/
// │   ├── ui/           ← Shadcn-based design components
// │   ├── forms/        ← RHF + Zod forms
// │   ├── tables/       ← Custom data tables
// ├── pages/
// │   ├── index.tsx     ← Dashboard
// │   ├── customers/
// │   ├── policies/
// │   ├── claims/
// │   ├── documents/
// ├── lib/
// │   ├── api/          ← tRPC hooks
// │   ├── auth/         ← User role utils
// ├── styles/
// │   └── globals.css   ← Tailwind + custom overrides
