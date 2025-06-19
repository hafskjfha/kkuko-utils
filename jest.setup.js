import '@testing-library/jest-dom'

// Mock window.fs if needed for file operations
Object.defineProperty(window, 'fs', {
  value: {
    readFile: jest.fn(),
  },
  writable: true,
})

// Mock URL.createObjectURL for file download tests
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
  writable: true,
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
})

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.result = null
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = 'mocked file content'
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
}