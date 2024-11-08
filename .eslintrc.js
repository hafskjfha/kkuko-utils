module.exports = {
    parser: '@typescript-eslint/parser', // TypeScript 파서를 사용
    parserOptions: {
        project: './tsconfig.json', // tsconfig.json 경로 설정
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020, // 최신 ECMAScript 문법 지원
        sourceType: 'module', // ES 모듈 사용
        ecmaFeatures: {
            jsx: true, // React의 JSX 사용 여부 (React를 사용하는 경우)
        },
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended', // TypeScript 추천 규칙
      'plugin:@typescript-eslint/recommended-requiring-type-checking', // 타입 체크를 필요로 하는 추천 규칙
      'prettier', // Prettier와 충돌 방지
    ],
    rules: {
      // 추가 규칙 설정
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 함수 반환 타입 명시 생략 허용
      '@typescript-eslint/no-explicit-any': 'warn', // any 타입 사용 경고
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 미사용 변수 경고 (일부 변수 무시)
      '@typescript-eslint/no-empty-function': 'warn', // 빈 함수 경고
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전에 맞춰 자동 감지
      },
    },
  };
  