# ✍️ Naming Conventions

이 문서는 프로젝트에서 일관된 네이밍을 유지하기 위한 가이드입니다. 함수, 변수, 파일, 컴포넌트 등의 이름을 정할 때 아래의 규칙을 따릅니다.

---

## 📦 1. 변수명 (Variables)

* **camelCase** 사용
* 가능한 명확하고 구체적인 의미 부여
* Boolean 변수는 `is`, `has`, `can` 등의 prefix 사용

```ts
const userName = "Alice";
const isLoggedIn = true;
const hasPermission = false;
```

---

## ⚙️ 2. 함수명 (Functions)
### 공통
* **camelCase** 사용
* 복수형을 처리하거나 반환하는 함수는 `s` suffix로 붙일 것을 권장

### 2.1 일반
* **동사 + 명사** 형태로 작성
* 기능 중심으로 명확하게

```ts
function fetchUserData() { ... }
function handleLoginClick() { ... }
function updateUserProfile() { ... }
```

### 2.2 DB (supabaseManager)
* **테이블** + **By파라미터** 형태 작성 
* 테이블 전체 데이터 fetch는 `all` prefix 사용

```ts
function wordById() {...}
function allDocs() {...}
```

---

## 🧱 3. 컴포넌트명 (React Components)

* **PascalCase** 사용
* 기능/역할 기반 명명

```tsx
// 올바른 예
function UserCard() { ... }
function LoginForm() { ... }

// 잘못된 예
function usercard() { ... }
function loginform() { ... }
```

---

## 📄 4. 파일/폴더명

* 파일: **kebab-case**
* 컴포넌트 파일은 컴포넌트 이름과 동일하게 (PascalCase + `.tsx`)
* 폴더는 보통 **kebab-case** 또는 **lowercase** 사용

```bash
# 파일 예시
login-form.tsx
user-card.tsx

# 폴더 예시
components/
utils/
hooks/
```

---

### 🧩 5. Hook 이름

* 반드시 `use`로 시작 (React 규칙)
* **camelCase**

```ts
useAuth();
useScrollPosition();
useDebounce();
```

---

### 🧾 6. 타입, 인터페이스 (TypeScript)

* **PascalCase**
* 인터페이스는 `I` 접두사 생략 가능

```ts
interface User {
  id: string;
  name: string;
}

type LoginResponse = { token: string };
```

---

### 🧠 7. 약어 및 축약어 사용

* 약어는 일관되게 작성 (`ID`, `URL` → `userId`, `imageUrl`)
* 전부 대문자로 쓰기보단 일반 단어처럼 다루기

```ts
let userId = "123"; // OK
let userID = "123"; // 지양
```

---

## 📌 추가 규칙

* 가능한 한 줄임말보다는 **풀어쓴 이름** 사용
* 이름만 봐도 무슨 역할인지 **의미가 명확하게**
* 하나의 기능/역할만 표현하도록
