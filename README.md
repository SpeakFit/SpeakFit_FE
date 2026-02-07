# 🎤 SpeakFit Frontend (SpeakFit_FE)

SpeakFit은 발표 연습 및 피드백을 제공하는 서비스입니다.  
이 레포지토리는 **SpeakFit 웹 프론트엔드(React + Vite + TypeScript)**를 담당합니다.

---

## 🧑‍💻 기술 스택

- React 18
- TypeScript
- Vite

---

## 📁 프로젝트 구조

```bash
src/
├── app/
│   ├── Router.tsx        # 라우팅 엔트리 (추후 적용)
│   └── routes.tsx        # 라우트 상수 정의
│
├── pages/                # 페이지 단위 컴포넌트
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── ...
│
├── components/           # 공통 컴포넌트
│   └── Layout.tsx
│
├── api/                  # API 통신 관련
│   ├── http.ts           # axios 인스턴스
│   └── auth.ts
│
├── auth/                 # 인증 관련 유틸
│   ├── tokenStore.ts
│   └── RequireAuth.tsx
│
├── types/                # 타입 정의
│   └── api.ts
│
├── main.tsx              # 앱 엔트리
└── index.css
```

## 🌱 브랜치 전략
```bash
main        → 배포용 (직접 작업 ❌)
develop     → 기본 개발 브랜치
feat/*      → 기능 단위 작업 브랜치
```

### 브랜치 예시
- 이슈번호-구현내용
```bash
feat/4-login-page
```

## 🔁 개발 흐름
1. develop 브랜치 기준으로 작업
2. 기능 단위로 feat/* 브랜치 생성
3. 작업 완료 후 base: develop으로 Pull Request 생성
4. 리뷰 후 머지

## 🚀 로컬 실행 방법
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
- 기본 접속 주소: http://localhost:5173

## 🧩 VS Code 권장 설정
프로젝트에는 팀 공통 설정이 포함되어 있습니다.
```bash
.vscode/
└── extensions.json
```
### 주요 설정 내용
- ESLint 자동 fix
- Prettier 기본 포매터 . . .
- 개인 테마, 키맵, UI 취향 설정은 각자 VS Code User Settings에서 자유롭게 변경해주세요.

## 📌 커밋 메시지 컨벤션
```bash
feat: 기능 추가
fix: 버그 수정
chore: 설정/환경/구조 변경
docs: 문서 수정
refactor: 리팩토링
```

### 커밋 메시지 예시
```bash
feat: 로그인 페이지 UI 추가
chore: 프로젝트 초기 구조 설정
```

## 📎 기타 안내
- .env 파일은 커밋하지 않습니다.
- 공통 설정 변경 시 팀원과 반드시 공유해주세요.
- 초기 세팅 관련 작업은 chore: prefix 사용을 권장합니다.
