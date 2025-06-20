import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ✅ 테스트 및 설정 파일 무시
  {
    ignores: [
      '**/*.test.tsx',
      '**/*.test.ts',
      'jest.config.ts',
      'jest.setup.ts',
    ],
  },
  // ✅ 기존 설정
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
    ignorePatterns: [
      'node_modules/',
      '.next/',
      'public/',
      'dist/',
      'test/',
      'supabase/',
    ],
  }),
];

export default eslintConfig;
