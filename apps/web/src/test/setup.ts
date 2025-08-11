import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock Firebase with better error handling
vi.mock('@/lib/firebase/config', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      // Simulate successful auth state change
      callback(null) // No user initially
      return vi.fn() // Return unsubscribe function
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    currentUser: null,
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
  storage: {
    ref: vi.fn(),
  },
  functions: {
    httpsCallable: vi.fn(),
  },
  analytics: {
    logEvent: vi.fn(),
  },
}))

// Mock React Router with better navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  const mockNavigate = vi.fn()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  }
})

// Mock react-helmet-async with better implementation
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: any }) => {
    // Simulate setting document metadata
    if (children) {
      const helmetData = children as any
      if (helmetData.props && helmetData.props.children) {
        helmetData.props.children.forEach((child: any) => {
          if (child.type === 'title') {
            document.title = child.props.children
          } else if (child.type === 'meta') {
            const meta = document.createElement('meta')
            if (child.props.name) meta.setAttribute('name', child.props.name)
            if (child.props.property) meta.setAttribute('property', child.props.property)
            if (child.props.content) meta.setAttribute('content', child.props.content)
            document.head.appendChild(meta)
          } else if (child.type === 'link') {
            const link = document.createElement('link')
            if (child.props.rel) link.setAttribute('rel', child.props.rel)
            if (child.props.href) link.setAttribute('href', child.props.href)
            if (child.props.hrefLang) link.setAttribute('hreflang', child.props.hrefLang)
            document.head.appendChild(link)
          } else if (child.type === 'script') {
            const script = document.createElement('script')
            if (child.props.type) script.setAttribute('type', child.props.type)
            if (child.props.children) script.textContent = child.props.children
            document.head.appendChild(script)
          }
        })
      }
    }
    return null
  },
  HelmetProvider: ({ children }: { children: any }) => children,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}

// Mock fetch
global.fetch = vi.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn()

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
  
  // Reset document title
  document.title = ''
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear()
  sessionStorageMock.clear()
  
  // Reset console mocks
  vi.mocked(console.error).mockClear()
  vi.mocked(console.warn).mockClear()
  vi.mocked(console.log).mockClear()
})

// Cleanup after tests
afterEach(() => {
  // Clean up any added elements
  document.head.innerHTML = ''
  document.body.innerHTML = ''
}) 