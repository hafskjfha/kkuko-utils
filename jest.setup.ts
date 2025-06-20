import '@testing-library/jest-dom'

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

// Mock FileReader
global.FileReader = class {
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  result: string | null = null

  readAsText(file: File) {
    setTimeout(() => {
      this.result = 'mocked file content'
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
} as any
