import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock canvas for confetti
HTMLCanvasElement.prototype.getContext = jest.fn()