**VINTUSURE**

**One‑sentence pitch:**  
 An internal insurance platform with AI-powered document understanding to help agents and staff instantly find policy answers using RAG (Retrieval-Augmented Generation).

---

## **1\. OVERVIEW**

**Goal:**

● Enable staff and agents to instantly find answers across all insurance products and documents.

● Reduce the need for manual document lookup or customer escalation.

● Leverage internal knowledge via AI and RAG to drive operational efficiency.

**Key Features:**

● AI assistant: *VintuSure AI*

● Insurance product & benefit management

● Document ingestion and embedding for RAG

● Query engine with contextual policy Q\&A

● Admin dashboard for agents and staff

● Secure role-based access

 

 

 

 

**Target Users & Success Criteria:**

● **Internal Insurance Staff & Agents**

● **Success \=** Faster query resolution, reduced time-to-answer, high staff adoption of VintuSure AI

---

## **2\. TECH STACK (GOLDEN PATH)**

**Runtime:** Node (Firebase Gen 2 Cloud Functions)  
**Language:** TypeScript (strict)  
**Front‑end:** React + Vite  
**UI kit:** shadcn/ui (Radix + Tailwind)  
**Styling:** Tailwind CSS  
**Routing:** React Router  
**State / data fetching:** TanStack Query  
**Forms & validation:** React Hook Form + Zod  
**Shared validation:** Zod  
**API layer:** tRPC  
**Backend services:** Firebase Auth · Firestore · Storage · Functions  
**RAG Integration:** VintuSure AI (embedding + vector search + LLM)  
**Package manager / mono:** PNPM workspaces  
**Build orchestration:** Turborepo  
**Component workshop:** Storybook  
**Unit / component tests:** Vitest + Testing Library  
**Visual / interaction:** Storybook  
**End‑to‑end tests:** Playwright  
**Linting:** ESLint + perfectionist  
**Formatting:** Prettier  
**Type-safe env vars:** T3 Env  
**CI / CD:** GitHub Actions

 

 

 

---

## **3\. MONOREPO LAYOUT (PNPM)**

`.`  
├── `apps/`  
│   └── `web/`              ← `Front‑end (React + Storybook)`  
├── `functions/`            ← `Firebase Functions & tRPC`  
├── `packages/`  
│   ├── `shared/`           ← `Common types, Zod schemas`  
│   ├── `seeding/`          ← `Firestore seeding scripts`  
│   └── `rag/`              ← `VintuSure AI: embeddings, query logic, chunking`  
├── `docs/`                 ← `TDD, ADRs, product notes`  
└── `.github/`              ← `GitHub Actions workflows`  
---

## **4\. ARCHITECTURE**

`User (Staff, Agent)`  
  ⇅ `Front‑end UI (React + TanStack Query)`  
  ⇅ `tRPC` → `Firebase Functions`  
  ⇅ `Firestore / Storage`  
  ⇅ `VintuSure AI:`  
     ├── `PDF Ingestion & Chunking`  
     ├── `Embedding Generator (e.g. OpenAI, Cohere)`  
     ├── `Vector Index (Firestore, Pinecone, etc.)`  
     └── `LLM Completion (RAG-based Answer Generation)`  
---

##  

##  

##  

## **5\. DATA MODEL**

| Entity | Key fields | Notes |
| ----- | ----- | ----- |
| User | uid, email, role | Firebase Auth |
| Document | id, fileURL, vectorChunks | Indexed for AI |
| Benefit | id, name, description, factors | Policy structure support |
| Product | id, classID, clauses, dependsOn | Business logic \+ rules |
| Query Log | id, userId, query, timestamp | RAG usage analytics |

●   
**Security rules:** Strict internal-access only via Firestore rules

● **Index strategy:** Composite indexes on policy metadata and query logs

---

## **6\. API DESIGN (tRPC)**

| Router | Procedure | Input (Zod schema) | Output |
| ----- | ----- | ----- | ----- |
| user | getById | uid | User |
| benefit | create / getAll | BenefitPayload | Benefit\[\] |
| product | update / getById | ProductPayload | Product |
| document | upload / embed | PDF file, metadata | Embedding log |
| rag | askQuestion | { query, context? } | { answer, doc } |

**Error-handling conventions:** Auth middleware, Zod validation, RAG fallback errors logged.

---

##  

##  

## **7\. TESTING STRATEGY**

| Level / focus | Toolset | Scope |
| ----- | ----- | ----- |
| Unit | Vitest | Utilities, embedding logic |
| Component | Testing Library | UI forms, RAG UI |
| Visual / interaction | Storybook | UI audits |
| End‑to‑end | Playwright | Auth, Upload, AI query flows |

**Coverage target:** 80%  
 **Fixtures / seeding:** `pnpm seed` to Firestore emulator and test vectors

---

## **8\. CI / CD PIPELINE (GITHUB ACTIONS)**

1\. Setup PNPM and restore Turbo cache

2\. Lint and typecheck

3\. Run unit/component tests

4\. Build Storybook for visual coverage

5\. Playwright E2E for key user flows

6\. Deploy preview (Firebase Hosting)

7\. On merge: auto-publish \+ optional reindex of vector DB

---

##  

##  

##  

## **9\. ENVIRONMENTS & SECRETS**

| Env | URL / target | Notes |
| ----- | ----- | ----- |
| local | localhost:5173 | Firebase Emulator Suite + .env |
| preview-* | Firebase Hosting channels | PR-based deployments |
| prod | https://vintusure.web.app | Internal-use deployment only |

**Secrets:**

● Firebase Auth keys

`● OPENAI_API_KEY` (for embeddings)

`● VECTOR_DB_KEY` (if using Pinecone/Qdrant)

● Managed via Firebase \+ GitHub secrets

---

## **10\. PERFORMANCE & SCALABILITY**

● Vector search limited to `topK=3–5` for optimal latency

● Chunked documents to avoid token overflow

● TanStack Query prefetching

● Cloud Function cold start optimization

● Debounce RAG query inputs to avoid overload

---

##  

##  

## **11\. MONITORING & LOGGING**

| Concern | Tool | Notes |
| ----- | ----- | ----- |
| Frontend errors | Sentry | Client error logging |
| Server logs | Google Cloud Logging | Structured logs for tRPC/RAG |
| Analytics | PostHog or GA4 | Query usage, click heatmaps |

---

## **12\. ACCESSIBILITY & I18N**

● Radix primitives for accessibility

● Keyboard navigation and color contrast (AA level)

● Future multilingual support for regional staff queries

---

## **13\. CODE QUALITY & FORMATTING**

● ESLint and Prettier enforced

● Husky for pre-commit checks

● Monorepo type safety via Zod and shared schemas

---

##  

##  

##  

## **14\. OPEN QUESTIONS / RISKS**

| Item | Owner | Resolution date |
| ----- | ----- | ----- |
| Embedding provider cost model | Tech Lead | TBD |
| Vector DB scalability (if remote) | Tech Team | TBD |
| LLM Token overflow strategy | AI Lead | TBD |

---

## **15\. APPENDICES**

● Setup script: `pnpm exec turbo run setup`

● Embedding logic: `packages/rag/embed.ts`

● Vector test suite: `packages/rag/test/index.test.ts`

● Branding / UX: VintuSure internal-only style guide

● Figma / mockups / API docs: \[link or folder\]

---

**Last updated:** 2025‑07‑29  
 **For internal use only.**

   
