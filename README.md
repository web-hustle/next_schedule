# 일정·습관 트래커

개인 할일 관리 + 습관 기록 + Gemini 자연어 채팅이 통합된 Next.js 앱.

## 스택

- Next.js 15 App Router (TypeScript)
- Supabase (PostgreSQL)
- Gemini 2.5-flash (자연어 파싱)
- Tailwind CSS + shadcn/ui

## 설정

### 1. 환경변수

`.env.local` 파일을 생성하고 아래 값을 채웁니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Supabase 대시보드 > Settings > API
GEMINI_API_KEY=your-gemini-api-key
DEV_USER_ID=any-uuid-v4                           # 예: a7f3c2e1-8b4d-4e9f-b6a2-1d5c7e3f9012
```

### 2. DB 마이그레이션

Supabase 대시보드 > SQL Editor에서 아래 파일을 붙여넣고 실행:

```
supabase/migrations/0001_init.sql
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## Vercel 배포

1. Vercel 대시보드 > Settings > Environment Variables에 `.env.local`의 5개 변수 등록
2. 배포:

```bash
vercel --prod
```

## 화면 구성

| 경로 | 설명 |
|------|------|
| `/` | 대시보드: 미완료 할일 목록 + 습관 버튼 그리드 |
| `/chat` | 채팅: 자연어로 할일 추가 / 습관 기록 |

## 채팅 예시

- `"종소세 납부 5월 31일까지"` → 할일 자동 등록
- `"어제 맥주 2잔 마셨어"` → 음주 습관에 2회 기록
- `"오늘 담배 피웠어"` → 흡연 습관 없으면 새로 추가할지 물어봄
