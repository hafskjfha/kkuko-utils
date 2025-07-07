const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts','<rootDir>/test/__mocks__/setupMocks.tsx'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)', // lucide-react는 변환 예외
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!app/**/layout.{js,jsx,ts,tsx}',
    '!app/**/page.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov"],
}

module.exports = createJestConfig(customJestConfig)
