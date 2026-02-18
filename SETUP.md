# PID-X 초기 설정 가이드

## 1. 의존성 설치

```bash
cd pid-x
pnpm install
```

> pnpm이 없다면: `npm install -g pnpm` 후 실행

## 2. Supabase 프로젝트 생성

1. https://supabase.com 에서 프로젝트 생성
2. 리전: 가까운 곳 (ap-northeast-1 등)
3. 생성 후 **Project Settings > API** 에서:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY`

## 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Supabase 키 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## 4. DB 마이그레이션 적용

### 방법 A: Supabase CLI (권장)
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 방법 B: SQL Editor (수동)
1. Supabase Dashboard → SQL Editor 열기
2. `supabase/migrations/00001_initial_schema.sql` 내용 붙여넣기 → Run
3. `supabase/migrations/00002_rls_policies.sql` 내용 붙여넣기 → Run

## 5. Supabase Auth 설정

Supabase Dashboard → Authentication → Providers:
1. **Email** 활성화 (기본)
2. **Google** (선택):
   - Google Cloud Console에서 OAuth Client ID 생성
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Client ID/Secret을 Supabase에 입력

## 6. 개발 서버 시작

```bash
pnpm dev
```

http://localhost:3000 에서 확인

## 7. Vercel 배포 (선택)

```bash
# Vercel CLI
npx vercel
```

또는 GitHub에 push → Vercel 대시보드에서 Import

## 8. TypeScript 타입 생성 (DB 변경 후)

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```
