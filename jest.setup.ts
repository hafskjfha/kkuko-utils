import '@testing-library/jest-dom'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver 모킹
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// matchMedia 모킹
Object.defineProperty(window as any, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// URL 객체 모킹
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// scrollTo 모킹
global.scrollTo = jest.fn();


// Mock window.fs
Object.defineProperty(window as any, 'fs', {
  value: {
    readFile: jest.fn(),
  },
  writable: true,
})

// Mock URL methods
Object.defineProperty(globalThis.URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
  writable: true,
})

Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
})


beforeEach(() => {
  jest.clearAllMocks();
});

// 테스트 후 정리
afterEach(() => {
  jest.clearAllTimers();
});
