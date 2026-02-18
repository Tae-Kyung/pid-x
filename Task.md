# PID-X 구현 태스크 (체크리스트) — Supabase + Vercel

**기준 문서**: PRD.md v1.1 (Supabase + Vercel 스택)
**총 기간**: MVP 8주 (4 Sprint)
**기술 스택**: Next.js 15 + Supabase + Vercel (TypeScript 단일 언어)
**표기법**: `[PRD X.X]` = PRD 참조 섹션, `(P0)` = 필수, `(P1)` = 중요

---

## 마스터 진도표

| Sprint | 기간 | 목표 | 진행 |
|--------|------|------|:----:|
| **S1** | W1~2 | Supabase 셋업 + DB 스키마 + 인증 + 프로젝트 CRUD | ░░░░░ 0% |
| **S2** | W3~4 | PDF 파싱 엔진 (pdfjs-dist + Regex) | ░░░░░ 0% |
| **S3** | W5~6 | 프론트엔드 핵심 화면 | ░░░░░ 0% |
| **S4** | W7~8 | 뷰어 + 보고서 + 통합 QA + Vercel 배포 | ░░░░░ 0% |

---

# Sprint 1: Supabase 셋업 + DB + 인증 + 프로젝트 CRUD (Week 1~2)

---

## 1.1 프로젝트 초기화

> PRD 참조: `[8.2 기술 스택]` `[8.3 디렉토리 구조]`

### T-001: Next.js + Supabase 프로젝트 스캐폴딩
- [ ] `pnpm create next-app@latest pid-x --typescript --tailwind --app --src-dir`
- [ ] `cd pid-x && pnpm add @supabase/supabase-js @supabase/ssr`
- [ ] shadcn/ui 초기화: `pnpm dlx shadcn@latest init`
- [ ] 필수 shadcn 컴포넌트 추가
  - [ ] `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`
  - [ ] `table`, `badge`, `tabs`, `select`, `form`, `toast`
  - [ ] `separator`, `skeleton`, `progress`, `scroll-area`, `accordion`
- [ ] 추가 패키지 설치
  - [ ] `recharts` (차트) — PRD `[8.2]`
  - [ ] `@tanstack/react-table` (테이블) — PRD `[8.2]`
  - [ ] `react-dropzone` (파일 업로드)
  - [ ] `react-pdf` (PDF 뷰어) — PRD `[8.2]`
  - [ ] `pdfjs-dist` (서버 사이드 PDF 텍스트 추출) — PRD `[8.2]`
  - [ ] `exceljs` (엑셀 생성) — PRD `[8.2]`
- [ ] `.env.local` 작성
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=...`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...` (서버 전용)
- [ ] `.gitignore` 확인 (Node, .env.local, .next)
- [ ] `git init` + 초기 커밋
- **검증**: `pnpm dev` → `localhost:3000` 페이지 렌더링

### T-002: Supabase 클라이언트 설정
> PRD: `[8.2]` `[8.3]` Supabase Client
- [ ] `src/lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
  - [ ] `createBrowserClient()` 사용 (@supabase/ssr)
  - [ ] 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] `src/lib/supabase/server.ts` — 서버용 Supabase 클라이언트
  - [ ] `createServerClient()` (cookies 연동, Route Handler/Server Component용)
  - [ ] Service Role 클라이언트 (관리자 작업용, RLS 우회)
- [ ] `src/lib/supabase/middleware.ts` — 세션 갱신 헬퍼
  - [ ] `updateSession()` 함수 (Supabase Auth 토큰 자동 갱신)
- [ ] `src/middleware.ts` — Next.js 미들웨어
  - [ ] 모든 요청에서 Supabase 세션 갱신
  - [ ] 미인증 사용자 `/login` 리다이렉트 (`/projects/**` 보호)
  - [ ] 인증 사용자 `/projects` 리다이렉트 (`/login`, `/register` 접근 시)
- [ ] `src/types/database.ts` — Supabase CLI로 생성할 타입 (placeholder)
- **검증**: Server Component에서 `supabase.auth.getUser()` 호출 동작

### T-003: Supabase 프로젝트 생성 및 설정
- [ ] [Supabase Dashboard](https://supabase.com) 에서 프로젝트 생성
  - [ ] 리전: Northeast Asia (ap-northeast-1) 또는 가까운 리전
  - [ ] 데이터베이스 비밀번호 안전하게 저장
- [ ] Supabase CLI 설치: `pnpm add -D supabase`
- [ ] `npx supabase init` → `supabase/` 디렉토리 생성
- [ ] `supabase/config.toml` 확인 및 로컬 개발 설정
- [ ] `npx supabase link --project-ref <ref>` (원격 프로젝트 연결)
- [ ] `.env.local`에 실제 Supabase URL/Key 설정
- [ ] Supabase Auth 설정 (Dashboard)
  - [ ] Email/Password 활성화
  - [ ] Google OAuth Provider 설정 (Client ID/Secret)
  - [ ] Redirect URL: `http://localhost:3000/auth/callback`
- [ ] Supabase Storage 버킷 생성
  - [ ] `pdf-uploads` 버킷 (비공개, 200MB 제한)
  - [ ] `reports` 버킷 (비공개)
- **검증**: `.env.local` 키로 Supabase 연결 성공

---

## 1.2 데이터베이스 스키마

> PRD 참조: `[5.1 ERD]` `[5.2 Enum]`

### T-004: Supabase 마이그레이션 — Enum + 핵심 테이블
> PRD: `[5.1]` `[5.2]` 13개 테이블 + 6개 Enum
- [ ] `npx supabase migration new initial_schema`
- [ ] `supabase/migrations/XXXXXX_initial_schema.sql` 작성:
- [ ] PostgreSQL Enum 타입 생성:
  ```sql
  CREATE TYPE test_medium AS ENUM ('H', 'V', 'P', 'S');
  CREATE TYPE package_status AS ENUM ('draft', 'ready', 'in_progress', 'completed', 'approved');
  CREATE TYPE golden_joint_status AS ENUM ('identified', 'welding', 'nde', 'pwht', 'approved');
  CREATE TYPE parse_status AS ENUM ('pending', 'processing', 'completed', 'failed');
  CREATE TYPE project_role AS ENUM ('admin', 'editor', 'viewer');
  CREATE TYPE line_status AS ENUM ('extracted', 'verified', 'modified');
  ```
- [ ] `profiles` 테이블 (Supabase Auth users 확장)
  - [ ] id (UUID, FK → auth.users), name, avatar_url, created_at
  - [ ] trigger: auth.users INSERT 시 profiles 자동 생성
- [ ] `projects` 테이블
  - [ ] id (UUID PK), name, client, description, owner_id (FK → profiles)
  - [ ] is_deleted (default false), deleted_at, created_at, updated_at
- [ ] `project_members` 테이블
  - [ ] user_id (FK → profiles), project_id (FK → projects), role (project_role)
  - [ ] invited_at, UNIQUE(user_id, project_id)
- [ ] `units` 테이블
  - [ ] id (UUID PK), project_id (FK), code (varchar 10), name, created_at
- [ ] `drawings` 테이블
  - [ ] id (UUID PK), unit_id (FK), drawing_no, title, revision, rev_date
  - [ ] page_start (int), page_end (int)
- [ ] `pdf_uploads` 테이블
  - [ ] id (UUID PK), project_id (FK), filename, file_size (bigint)
  - [ ] storage_path (text), total_pages (int), parse_status (parse_status)
  - [ ] revision (varchar), uploaded_at, uploaded_by (FK → profiles)
- [ ] `page_texts` 테이블
  - [ ] id (UUID PK), upload_id (FK → pdf_uploads ON DELETE CASCADE)
  - [ ] page_number (int), raw_text (text), drawing_id (FK nullable), extracted_at
- [ ] `pipe_lines` 테이블
  - [ ] id (UUID PK), project_id (FK), line_number (varchar), nominal_size (varchar)
  - [ ] service_code (varchar), spec_class (varchar), unit_id (FK nullable)
  - [ ] source_pages (jsonb), status (line_status default 'extracted'), created_at
  - [ ] UNIQUE(project_id, line_number)
- [ ] `equipment` 테이블
  - [ ] id (UUID PK), project_id (FK), tag_no (varchar), equip_type (varchar)
  - [ ] unit_id (FK nullable), source_pages (jsonb), created_at
  - [ ] UNIQUE(project_id, tag_no)
- [ ] `instruments` 테이블
  - [ ] id (UUID PK), project_id (FK), tag_no (varchar), function_type (varchar)
  - [ ] unit_id (FK nullable), source_pages (jsonb), created_at
- [ ] `test_packages` 테이블
  - [ ] id (UUID PK), project_id (FK), package_no (varchar), system_code (varchar)
  - [ ] test_pressure (varchar), test_medium (test_medium), source_page (int)
  - [ ] status (package_status default 'draft'), created_at
- [ ] `golden_joints` 테이블
  - [ ] id (UUID PK), project_id (FK), test_package_id (FK nullable)
  - [ ] source_page (int), related_lines (jsonb), status (golden_joint_status default 'identified')
  - [ ] created_at
- [ ] `pkg_line_map` 테이블 (M:N)
  - [ ] package_id (FK → test_packages), pipeline_id (FK → pipe_lines)
  - [ ] PRIMARY KEY (package_id, pipeline_id)
- [ ] `audit_logs` 테이블
  - [ ] id (UUID PK), user_id (FK), project_id (FK), action (varchar)
  - [ ] entity_type (varchar), entity_id (UUID), old_value (jsonb), new_value (jsonb)
  - [ ] created_at (timestamptz default now())
- [ ] 인덱스 생성:
  - [ ] `pipe_lines(project_id, nominal_size)`, `pipe_lines(project_id, service_code)`
  - [ ] `equipment(project_id, equip_type)`
  - [ ] `test_packages(project_id, system_code)`
  - [ ] `page_texts(upload_id, page_number)`
  - [ ] `audit_logs(project_id, created_at)`
- [ ] `npx supabase db push` (원격 적용) 또는 `npx supabase migration up` (로컬)
- **검증**: Supabase Dashboard → Table Editor에서 13개 테이블 + 6개 Enum 확인

### T-005: RLS (Row Level Security) 정책
> PRD: `[4.3]` RLS + RBAC
- [ ] `npx supabase migration new rls_policies`
- [ ] 모든 테이블에 RLS 활성화: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- [ ] `profiles` RLS:
  - [ ] SELECT: 인증 사용자 모두 조회 가능
  - [ ] UPDATE: 본인만 수정
- [ ] `projects` RLS:
  - [ ] SELECT: owner이거나 project_members에 존재하는 사용자
  - [ ] INSERT: 인증 사용자 (owner_id = auth.uid())
  - [ ] UPDATE/DELETE: owner 또는 admin 역할
- [ ] `project_members` RLS:
  - [ ] SELECT: 해당 프로젝트 멤버만
  - [ ] INSERT/UPDATE/DELETE: 프로젝트 admin만
- [ ] `units`, `drawings`, `pdf_uploads`, `page_texts` RLS:
  - [ ] SELECT: 해당 프로젝트 멤버
  - [ ] INSERT/UPDATE: editor 이상
- [ ] `pipe_lines`, `equipment`, `instruments` RLS:
  - [ ] SELECT: 해당 프로젝트 멤버
  - [ ] INSERT: service_role 전용 (파서가 삽입)
  - [ ] UPDATE: editor 이상
- [ ] `test_packages`, `golden_joints`, `pkg_line_map` RLS:
  - [ ] SELECT: 해당 프로젝트 멤버
  - [ ] INSERT: service_role 전용
  - [ ] UPDATE: editor 이상
- [ ] `audit_logs` RLS:
  - [ ] SELECT: 해당 프로젝트 admin
  - [ ] INSERT: service_role 전용
- [ ] RLS 헬퍼 함수 생성:
  ```sql
  CREATE OR REPLACE FUNCTION is_project_member(p_id UUID)
  RETURNS BOOLEAN AS $$
    SELECT EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = p_id AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = p_id AND owner_id = auth.uid()
    );
  $$ LANGUAGE sql SECURITY DEFINER;
  ```
- [ ] `npx supabase db push`
- **검증**: Supabase Dashboard에서 RLS 정책 확인, 미인증 쿼리 → 빈 결과

### T-006: TypeScript 타입 생성
- [ ] `npx supabase gen types typescript --linked > src/types/database.ts`
- [ ] `src/types/index.ts` — 프론트엔드용 확장 타입 정의
  - [ ] `Project` (통계 포함), `PipeLineRow`, `EquipmentRow`, `TestPackageRow`
  - [ ] `DashboardStats`, `LineListFilter`, `PaginatedResponse<T>`
  - [ ] API 응답/요청 타입 정의
- **검증**: TypeScript 컴파일 에러 없음

---

## 1.3 인증 시스템

> PRD 참조: `[FR-603]` `[4.3 보안]` `[6.1 API]`

### T-007: Supabase Auth 통합 (서버 + 클라이언트)
> PRD: `[FR-603]` Supabase Auth, `[4.3]` JWT 자동 관리
- [ ] `src/app/auth/callback/route.ts` — OAuth 콜백 핸들러
  - [ ] code → session 교환 (Supabase `exchangeCodeForSession`)
  - [ ] 성공 → `/projects` 리다이렉트
  - [ ] 실패 → `/login?error=...` 리다이렉트
- [ ] `src/app/auth/confirm/route.ts` — 이메일 인증 확인 핸들러
- [ ] `src/hooks/useAuth.ts` — 인증 상태 훅
  - [ ] `user` 상태 (Supabase onAuthStateChange 구독)
  - [ ] `signIn(email, password)`, `signUp(email, password, name)`, `signOut()`
  - [ ] `signInWithGoogle()` — OAuth
  - [ ] `loading` 상태
- [ ] `src/lib/supabase/middleware.ts` 완성
  - [ ] 모든 요청에서 세션 갱신 (access_token 만료 시 자동 refresh)
- [ ] profiles 트리거 확인:
  - [ ] auth.users에 새 사용자 생성 시 → profiles에 자동 INSERT
  - [ ] name은 user_metadata에서 가져옴
- **검증**: 이메일 가입 → 로그인 → 세션 유지 → 로그아웃 플로우 동작

### T-008: 로그인 페이지 UI
> PRD: `[7.2]` 화면 #1
- [ ] `src/app/(auth)/login/page.tsx`
  - [ ] 이메일 입력 (shadcn Input + Label)
  - [ ] 비밀번호 입력 (type=password)
  - [ ] "로그인" 버튼 (shadcn Button)
  - [ ] "Google로 로그인" 버튼 — PRD `[FR-603]` OAuth
  - [ ] 구분선 "또는"
  - [ ] 폼 유효성 검증 (이메일 형식, 비밀번호 8자 이상)
  - [ ] 에러 메시지 표시 (잘못된 이메일/비밀번호)
  - [ ] 로딩 상태 (버튼 disabled + 스피너)
  - [ ] 성공 시 → `/projects` 리다이렉트
  - [ ] "회원가입" 링크 → `/register`
- **검증**: 이메일 로그인 + Google OAuth 로그인 모두 동작

### T-009: 회원가입 페이지 UI
> PRD: `[7.2]` 화면 #1
- [ ] `src/app/(auth)/register/page.tsx`
  - [ ] 이름, 이메일, 비밀번호, 비밀번호 확인 입력
  - [ ] 폼 유효성 검증 + 비밀번호 일치 확인
  - [ ] Supabase `signUp()` 호출 (user_metadata에 name 포함)
  - [ ] 이메일 확인 안내 메시지 표시 (또는 자동 로그인)
  - [ ] 에러 메시지 (중복 이메일 등)
  - [ ] "로그인" 링크 → `/login`
- **검증**: 가입 → 이메일 확인 → 로그인 플로우

---

## 1.4 프로젝트 CRUD

> PRD 참조: `[FR-601]` `[6.2 API]` `[7.2]` 화면 #2

### T-010: 프로젝트 CRUD API (Route Handlers)
> PRD API: `[6.2]` GET/POST/PUT/DELETE /api/projects
- [ ] `src/app/api/projects/route.ts`
  - [ ] `GET` — 프로젝트 목록
    - [ ] Supabase RLS 자동 필터 (로그인 사용자의 프로젝트만)
    - [ ] is_deleted=false 필터
    - [ ] 각 프로젝트의 라인/장비/패키지 수 (count 쿼리 또는 DB function)
    - [ ] 페이지네이션 (range)
  - [ ] `POST` — 프로젝트 생성
    - [ ] name (필수), description, client
    - [ ] owner_id = 현재 사용자 (auth.uid())
    - [ ] project_members에 admin으로 자동 추가
    - [ ] 201 Created
- [ ] `src/app/api/projects/[id]/route.ts`
  - [ ] `GET` — 프로젝트 상세 (RLS 자동 권한 체크)
  - [ ] `PUT` — 프로젝트 수정 (admin 권한 확인)
  - [ ] `DELETE` — 소프트 삭제 (is_deleted=true, deleted_at=now) — PRD `[FR-601]`
- [ ] `src/app/api/projects/[id]/dashboard/route.ts`
  - [ ] `GET` — 프로젝트 통계 (Supabase RPC 또는 집계 쿼리)
- **검증**: API 호출로 프로젝트 CRUD 전체 플로우 동작

### T-011: 프로젝트 목록 UI
> PRD: `[7.2]` 화면 #2
- [ ] `src/app/projects/page.tsx`
  - [ ] Supabase 클라이언트로 프로젝트 목록 조회
  - [ ] 프로젝트 카드 그리드 (shadcn Card)
    - [ ] 프로젝트명, 클라이언트명
    - [ ] 라인 수 / 장비 수 / 패키지 수 뱃지
    - [ ] 생성일
    - [ ] 클릭 → `/projects/[id]` 이동
  - [ ] "새 프로젝트" 버튼 (우측 상단)
  - [ ] 빈 상태: "아직 프로젝트가 없습니다. 첫 프로젝트를 생성해 보세요."
  - [ ] 로딩 상태: 스켈레톤 카드 4개
- [ ] `src/components/projects/CreateProjectDialog.tsx`
  - [ ] shadcn Dialog 사용
  - [ ] 입력: 프로젝트명(필수), 설명(선택), 클라이언트명(선택)
  - [ ] 성공 → 목록 새로고침 + 토스트 알림
- **검증**: 프로젝트 0개/1개/3개일 때 각각 올바르게 표시

### T-012: 프로젝트 레이아웃 (사이드바)
> PRD: `[7.1 화면 구성]`
- [ ] `src/app/projects/[id]/layout.tsx`
  - [ ] 좌측 사이드바 (240px 고정)
    - [ ] 프로젝트명 표시 (상단)
    - [ ] 네비게이션 메뉴 항목:
      - [ ] Dashboard (`/projects/[id]`)
      - [ ] Line List (`/projects/[id]/lines`)
      - [ ] Equipment (`/projects/[id]/equipment`)
      - [ ] Packages (`/projects/[id]/packages`)
      - [ ] Viewer (`/projects/[id]/viewer`)
      - [ ] Reports (`/projects/[id]/reports`)
      - [ ] Settings (`/projects/[id]/settings`)
    - [ ] 현재 페이지 활성 표시 (active 스타일)
  - [ ] 우측 메인 콘텐츠 영역 (flex-1)
  - [ ] 상단 헤더 바 (프로젝트 전환 드롭다운, 사용자 메뉴, 로그아웃)
- **검증**: 사이드바 네비게이션 → 각 페이지 이동 동작

---

### Sprint 1 완료 체크포인트
- [ ] Supabase 프로젝트 연결 + 환경변수 설정 완료
- [ ] DB에 13개 테이블 + 6개 Enum 존재 (Supabase Dashboard 확인)
- [ ] RLS 정책 전체 적용 (미인증 접근 차단 확인)
- [ ] 이메일 가입 → 로그인 → 세션 유지 → 로그아웃 플로우 동작
- [ ] Google OAuth 로그인 동작
- [ ] 프로젝트 생성 → 목록 표시 → 상세 → 삭제 플로우 동작
- [ ] 프로젝트 레이아웃 사이드바 네비게이션 동작
- [ ] `pnpm build` 에러 없음
- [ ] Vercel Preview 배포 동작 확인

---

# Sprint 2: PDF 파싱 엔진 (Week 3~4)

---

## 2.1 PDF 업로드

> PRD 참조: `[FR-101]` `[6.3 API]` `[4.2]` 200MB 제한

### T-013: PDF 업로드 API
> PRD: `[FR-101]` 최대 200MB, Supabase Storage
- [ ] `src/app/api/projects/[id]/uploads/route.ts`
  - [ ] `POST` — PDF 업로드 (multipart/form-data)
    - [ ] 파일 유효성 검증
      - [ ] PDF 매직넘버 (`%PDF`) 확인
      - [ ] 파일 크기 200MB 이내 — PRD `[FR-101]`
    - [ ] Supabase Storage 업로드 (`pdf-uploads` 버킷)
      - [ ] 경로: `{project_id}/{upload_id}/{filename}`
    - [ ] `pdf_uploads` 레코드 생성 (parse_status='pending')
    - [ ] 파싱 API 비동기 호출 트리거
    - [ ] 201 Created + UploadResponse 반환
  - [ ] `GET` — 업로드 이력 (해당 프로젝트, 최신순)
- [ ] Supabase Storage 정책 설정:
  - [ ] INSERT: 인증 사용자 + 프로젝트 멤버 확인
  - [ ] SELECT: 프로젝트 멤버만 다운로드 가능
- **검증**: PDF 업로드 → Supabase Storage에 파일 존재 + DB 레코드 생성

### T-014: PDF 업로드 UI
> PRD: `[7.2]` 화면 #3
- [ ] `src/app/projects/[id]/upload/page.tsx`
  - [ ] 드래그앤드롭 영역 (react-dropzone)
    - [ ] "PDF 파일을 드래그하거나 클릭하여 선택" 안내 텍스트
    - [ ] 파일 크기/형식 프론트 검증
    - [ ] 드래그 오버 시 시각적 피드백
  - [ ] Supabase Storage 직접 업로드 (클라이언트 → Storage → DB 기록)
  - [ ] 업로드 진행률 표시 (프로그레스 바)
  - [ ] 업로드 완료 후 → 파싱 진행률 표시
    - [ ] Supabase Realtime 구독 (pdf_uploads 테이블 변경 감지)
    - [ ] "텍스트 추출 중... 150/417 페이지 (36%)" 표시
    - [ ] "데이터 분석 중... 라인 추출 진행 중" 표시
  - [ ] 파싱 완료 → "완료! 대시보드로 이동" 버튼
  - [ ] 에러 발생 → 에러 메시지 + "재시도" 버튼
- **검증**: PDF 업로드 → 파싱 완료까지 전체 UI 플로우

---

## 2.2 텍스트 추출 엔진

> PRD 참조: `[FR-102]` pdfjs-dist, 417페이지 60초 이내

### T-015: PDF 텍스트 추출 서비스
> PRD: `[FR-102]` 60초 이내, 텍스트 존재 여부 판별
- [ ] `src/lib/parser/pdf-extractor.ts`
  - [ ] `extractTextFromPdf(storagePath: string): Promise<PageTextData[]>`
    - [ ] Supabase Storage에서 PDF 다운로드 (service role 클라이언트)
    - [ ] `pdfjs-dist` Node.js 빌드 사용 (`getDocument()`)
    - [ ] 페이지별 순회: `page.getTextContent()` → 텍스트 결합
    - [ ] 텍스트 유무 판별: `text.trim().length > 100` 기준
    - [ ] 결과: `[{pageNumber, rawText, hasText}]`
    - [ ] 메모리 관리: 페이지 처리 후 즉시 cleanup
  - [ ] `savePageTexts(uploadId: string, pages: PageTextData[])` — DB 벌크 인서트
    - [ ] Supabase service role 클라이언트로 `page_texts` INSERT
    - [ ] 50건 단위 배치 인서트
  - [ ] 진행률 업데이트: 매 10페이지마다 `pdf_uploads.parse_status` 업데이트
    - [ ] Supabase Realtime이 자동으로 변경 감지 → 클라이언트에 Push
- [ ] `src/app/api/uploads/[id]/parse/route.ts` — 파싱 실행 엔드포인트
  - [ ] Vercel Serverless Function (maxDuration: 300초 — Vercel Pro)
  - [ ] `vercel.json`에 함수 설정: `{ "functions": { "src/app/api/uploads/*/parse/route.ts": { "maxDuration": 300, "memory": 3008 } } }`
- **검증**: 417페이지 PDF → 텍스트 추출 완료 + DB 저장

---

## 2.3 데이터 파서 (6개)

> PRD 참조: `[FR-103]` ~ `[FR-108]`

### T-016: 도면 메타데이터 파서
> PRD: `[FR-103]` Drawing No, Project Name, Unit No, Revision, Rev Date, Sheet Title
- [ ] `src/lib/parser/metadata-parser.ts`
  - [ ] `parseMetadata(pageTexts: PageTextRow[]): MetadataResult`
  - [ ] Regex 패턴 구현 (TypeScript):
    - [ ] Drawing No: `/A8RX-CHT-\d{4}-PRC-PID-\d{3}(?:-\d{2})?/g`
    - [ ] Unit Code: Drawing No에서 `\d{4}` 그룹
    - [ ] Revision: `/ISSUED FOR (\w+)(?:\s*\(([^)]+)\))?/` + `/Rev\.?\s*(\w+)/`
    - [ ] Rev Date: `/(\d{1,2}[-/]\w{3}[-/]\d{2,4})/`
  - [ ] 페이지 → 도면 매핑: 동일 도면번호 연속 페이지 그룹핑
  - [ ] Unit 자동 생성: 고유 유닛 코드 추출 → `units` 테이블 upsert
  - [ ] Drawing 레코드 생성: `drawings` 테이블 upsert
- **검증**: 277개 도면 번호, 6개 유닛 코드 추출 (대아 기준)

### T-017: 배관 라인 번호 파서 (핵심)
> PRD: `[FR-104]` 정확도 90%, 라인번호 구조 `[SIZE]-[SERVICE]-[NUMBER]-[SPEC]`
- [ ] `src/lib/parser/line-parser.ts`
  - [ ] `parseLines(pageTexts: PageTextRow[]): LineData[]`
  - [ ] 1차 Regex: `/(\d{1,2})[\"']\s*[-]?\s*([A-Z]{2,4})\s*[-]\s*(\d{3,5})\s*[-]?\s*([A-Z0-9]{2,10})?/g`
  - [ ] 2차 Regex (변형 패턴): 공백/줄바꿈으로 분리된 라인번호
  - [ ] 파싱 결과:
    - [ ] `lineNumber`: 정규화된 전체 문자열
    - [ ] `nominalSize`: Group 1 → `"6""`
    - [ ] `serviceCode`: Group 2 → `"P"`, `"SG"`, `"CW"` 등
    - [ ] `specClass`: Group 4 → `"01SA0S04"` 등
  - [ ] 중복 제거: `Map<lineNumber, LineData>`, 출현 페이지 accumulate
  - [ ] Unit 매핑: 페이지 → 도면 → 유닛 연결
  - [ ] 노이즈 필터링:
    - [ ] 도면번호(A8RX-...) 패턴 제외
    - [ ] 타이틀 블록 영역 패턴 제외
    - [ ] 사이즈 0" 또는 60" 초과 제외
  - [ ] DB 벌크 인서트: `pipe_lines` 테이블 (service role 클라이언트)
- **검증**: 7,158개 라인 중 90% 이상 추출 (6,400+), 사이즈 1"~56" 범위

### T-018: 장비 태그 파서
> PRD: `[FR-105]` 정확도 85%, 장비 타입 분류 10종
- [ ] `src/lib/parser/equipment-parser.ts`
  - [ ] `parseEquipment(pageTexts: PageTextRow[]): EquipmentData[]`
  - [ ] Regex: `/\b([A-Z]{1,3})-(\d{4,5}[A-Z]?(?:\/[A-Z])?)\b/g`
  - [ ] 장비 타입 분류 Map:
    ```typescript
    const EQUIP_TYPE_MAP: Record<string, string> = {
      'V': 'Vessel', 'E': 'Heat Exchanger', 'P': 'Pump',
      'C': 'Compressor', 'T': 'Tower', 'D': 'Drum',
      'F': 'Furnace', 'R': 'Reactor', 'AE': 'Air Exchanger',
      'AD': 'Air Dryer'
    };
    ```
  - [ ] 노이즈 필터링 + 중복 제거 + DB 벌크 인서트
- **검증**: 추출 수 8,000~10,000, 장비 타입 10종 존재

### T-019: Test Package 파서
> PRD: `[FR-106]` 정확도 95%, 멀티라인 Regex
- [ ] `src/lib/parser/package-parser.ts`
  - [ ] `parsePackages(pageTexts: PageTextRow[]): PackageData[]`
  - [ ] 멀티라인 Regex:
    ```typescript
    /Package\s*no\.?\s*:\s*([\w-]+)\s*\n\s*Test\s*Pressure\s*:\s*([\w\s.]+?)\s*\n\s*Test\s*Medium\s*:\s*([HVPS])/gi
    ```
  - [ ] 파싱 결과: packageNo, testPressure, testMedium, sourcePage, systemCode
  - [ ] 중복 제거 + DB 벌크 인서트: `test_packages` 테이블
- **검증**: 추출 수 1,400~1,500 (1,471 기대), 매체 분포 H/V/P/S 근사

### T-020: 계장 태그 + Golden Joint 파서
> PRD: `[FR-107]` `[FR-108]`
- [ ] `src/lib/parser/instrument-parser.ts`
  - [ ] Regex: `/\b([TFPLSA]I[CTRAS]?)-(\d{4,5})\b/g`
  - [ ] Function Type 분류 + 중복 제거 + DB 인서트
- [ ] `src/lib/parser/golden-joint-parser.ts`
  - [ ] "Golden Joint" 키워드 검색 (case insensitive)
  - [ ] 해당 페이지 내 인접 라인번호/패키지번호 추출
  - [ ] DB 인서트: `golden_joints` 테이블
- **검증**: 계장 400~550개 (491 기대), Golden Joint 15~20 페이지 (17 기대)

---

## 2.4 파싱 오케스트레이터

### T-021: 통합 파싱 파이프라인
- [ ] `src/app/api/uploads/[id]/parse/route.ts` 완성
  - [ ] `POST` 핸들러 — Vercel Serverless Function (maxDuration: 300)
  - [ ] Supabase service role 클라이언트 사용 (RLS 우회)
  - [ ] 실행 순서:
    1. [ ] `pdf_uploads` 상태 → 'processing' 업데이트
    2. [ ] **Step 1**: 텍스트 추출 (`pdf-extractor.ts`) — 진행률: 0~30%
    3. [ ] **Step 2**: 메타데이터 파싱 (`metadata-parser.ts`) — 진행률: 30~40%
    4. [ ] **Step 3**: 라인 파싱 (`line-parser.ts`) — 진행률: 40~60%
    5. [ ] **Step 4**: 장비 파싱 (`equipment-parser.ts`) — 진행률: 60~70%
    6. [ ] **Step 5**: 패키지 파싱 (`package-parser.ts`) — 진행률: 70~85%
    7. [ ] **Step 6**: 계장 파싱 (`instrument-parser.ts`) — 진행률: 85~90%
    8. [ ] **Step 7**: Golden Joint 파싱 (`golden-joint-parser.ts`) — 진행률: 90~95%
    9. [ ] **Step 8**: 통계 계산 + 최종 확인 — 진행률: 95~100%
    10. [ ] `pdf_uploads` 상태 → 'completed'
  - [ ] 진행률 업데이트 방식:
    - [ ] `pdf_uploads` 테이블에 `progress` (int) 컬럼 추가 (migration)
    - [ ] 각 단계에서 progress 값 UPDATE → Supabase Realtime 자동 Push
  - [ ] 에러 핸들링:
    - [ ] 개별 단계 실패 시 해당 단계 skip, 부분 결과 보존
    - [ ] 전체 실패 시 status → 'failed' + error_message 기록
  - [ ] 대용량 처리 최적화:
    - [ ] 페이지 청크 처리 (50페이지 단위)
    - [ ] 벌크 인서트 배치 사이즈 50
    - [ ] 메모리 해제 (Buffer cleanup)
- [ ] `src/app/api/uploads/[id]/status/route.ts`
  - [ ] `GET` — 현재 파싱 상태 반환 (polling fallback)
  - [ ] parse_status, progress, error_message
- **검증**: 대아 PDF 전체 파싱 완료
  - [ ] PageText: 417개
  - [ ] Drawing: 200+ 개
  - [ ] PipeLine: 6,000+ 개
  - [ ] Equipment: 8,000+ 개
  - [ ] TestPackage: 1,400+ 개
  - [ ] Instrument: 400+ 개
  - [ ] GoldenJoint: 15+ 개
  - [ ] 전체 소요 시간 < 300초 (Vercel Pro 제한)

---

### Sprint 2 완료 체크포인트
- [ ] PDF 업로드 → Supabase Storage 저장 동작
- [ ] 417페이지 PDF 텍스트 추출 동작
- [ ] 라인 추출 6,000건 이상 (정확도 90%)
- [ ] 장비 추출 8,000건 이상 (정확도 85%)
- [ ] 패키지 추출 1,400건 이상 (정확도 95%)
- [ ] 계장 추출 400건 이상
- [ ] Golden Joint 15건 이상
- [ ] Supabase Realtime으로 파싱 진행률 실시간 표시
- [ ] 업로드 → 파싱 완료 UI 플로우 동작
- [ ] Vercel Preview 배포에서 파싱 동작 확인

---

# Sprint 3: 프론트엔드 핵심 화면 (Week 5~6)

---

## 3.1 프로젝트 대시보드

> PRD 참조: `[FR-203]` `[US-604]` `[7.2]` 화면 #4

### T-022: 대시보드 통계 API + UI
> PRD API: `[6.2]` GET /api/projects/:id/dashboard, `[FR-203]` 차트 4종
- [ ] `src/app/api/projects/[id]/dashboard/route.ts` 완성
  - [ ] Supabase 집계 쿼리 (RPC 또는 직접 쿼리):
    - [ ] total_lines, total_equipment, total_packages, total_instruments
    - [ ] size_distribution: GROUP BY nominal_size
    - [ ] service_distribution: GROUP BY service_code
    - [ ] unit_distribution: 유닛별 라인/장비/패키지 수
    - [ ] medium_distribution: GROUP BY test_medium
    - [ ] package_status_distribution: GROUP BY status
- [ ] `src/app/projects/[id]/page.tsx` (대시보드 메인)
- [ ] 통계 카드 행 (상단)
  - [ ] `src/components/dashboard/StatsCards.tsx`
  - [ ] 4개 카드: Lines, Equipment, Packages, Units (숫자 + 라벨 + 아이콘)
  - [ ] 로딩 시 스켈레톤
- [ ] 차트 행 (중단)
  - [ ] `src/components/dashboard/SizeChart.tsx` — 사이즈별 Bar Chart (Recharts)
  - [ ] `src/components/dashboard/ServiceChart.tsx` — 서비스별 Pie Chart
  - [ ] `src/components/dashboard/MediumChart.tsx` — 시험매체별 Donut Chart
  - [ ] 차트 클릭 → 해당 Line List로 드릴다운 (쿼리 파라미터 전달)
- [ ] 유닛별 요약 테이블 (하단)
  - [ ] `src/components/dashboard/UnitSummary.tsx`
- **검증**: 데이터 있을 때 차트 + 통계 카드 + 유닛 요약 렌더링 확인

---

## 3.2 Line List 화면

> PRD 참조: `[FR-201]` `[FR-202]` `[US-201~204]` `[6.4 API]`

### T-023: Line List API
> PRD API: `[6.4]` 5개 엔드포인트
- [ ] `src/app/api/projects/[id]/lines/route.ts`
  - [ ] `GET` — 라인 목록
    - [ ] 쿼리 파라미터: page, limit, sort, order, size, service, unit, spec, search
    - [ ] Supabase 쿼리 빌더 (`.from('pipe_lines').select().eq().ilike().range().order()`)
    - [ ] COUNT 쿼리 (total)
    - [ ] 200 OK + { items, total, page, limit }
  - [ ] `PATCH` — 벌크 수정 (ids + updates)
    - [ ] status → 'modified' 자동 변경
    - [ ] audit_logs 기록
- [ ] `src/app/api/projects/[id]/lines/[lineId]/route.ts`
  - [ ] `GET` — 라인 상세
  - [ ] `PUT` — 라인 수정 + AuditLog
- [ ] `src/app/api/projects/[id]/lines/stats/route.ts`
  - [ ] `GET` — 라인 통계 (사이즈/서비스별)
- **검증**: 필터 + 정렬 + 페이지네이션 동작

### T-024: Line List 테이블 UI
> PRD: `[FR-201]` 8개 컬럼, 페이지네이션 50/100/200/500, `[7.2]` 화면 #5
- [ ] `src/app/projects/[id]/lines/page.tsx`
- [ ] `src/components/line-list/LineListTable.tsx`
  - [ ] TanStack Table 구성 (PRD FR-201 컬럼):
    - [ ] Line Number, Nominal Size, Service Code, Spec Class
    - [ ] Unit, Source Drawing, Source Pages (Badge), Status (Badge 색상)
  - [ ] 서버사이드 페이지네이션: 50/100/200/500
  - [ ] 컬럼 헤더 클릭 정렬
  - [ ] 행 선택 체크박스 (벌크 편집용)
- [ ] `src/components/line-list/LineListFilters.tsx`
  - [ ] 사이즈/서비스/유닛 다중선택 필터
  - [ ] Spec 텍스트 입력, 전체 검색 (디바운스 300ms)
  - [ ] "필터 초기화" 버튼
- [ ] 인라인 편집 — PRD `[FR-202]`
  - [ ] 셀 더블클릭 → 편집 모드 (Input 교체)
  - [ ] Enter → 저장 (PUT API), Escape → 취소
- [ ] 벌크 편집
  - [ ] 선택된 행 > 0 시 벌크 툴바
  - [ ] Status 일괄 변경 (PATCH API)
- [ ] 페이지 상단: "총 7,158 라인" 카운트
- **검증**: 7,000개 라인 로딩, 필터, 정렬, 인라인 편집, 벌크 편집 동작

---

## 3.3 Equipment List 화면

> PRD 참조: `[FR-105]` `[US-103]` `[6.5 API]` `[7.2]` 화면 #6

### T-025: Equipment API + UI
- [ ] `src/app/api/projects/[id]/equipment/route.ts`
  - [ ] `GET` — 장비 목록 (필터: type, unit, search / 페이지네이션)
- [ ] `src/app/api/projects/[id]/equipment/[eqId]/route.ts`
  - [ ] `GET`, `PUT`
- [ ] `src/app/api/projects/[id]/equipment/stats/route.ts`
  - [ ] `GET` — 장비 통계
- [ ] `src/app/projects/[id]/equipment/page.tsx`
  - [ ] `src/components/equipment/EquipmentTable.tsx` — TanStack Table
    - [ ] 컬럼: Tag No, Type, Unit, Source Pages
    - [ ] 타입별/유닛별 필터, 검색, 페이지네이션
  - [ ] 상단 통계: 타입별 장비 수 뱃지 바
- **검증**: 9,000개 장비 로딩 + 필터 동작

---

## 3.4 Test Package 화면

> PRD 참조: `[FR-301~304]` `[US-301~305]` `[6.6 API]` `[7.2]` 화면 #7, #8

### T-026: Package API
- [ ] `src/app/api/projects/[id]/packages/route.ts`
  - [ ] `GET` — 패키지 목록 (필터: system_code, medium, status)
- [ ] `src/app/api/projects/[id]/packages/[pkgId]/route.ts`
  - [ ] `GET` — 패키지 상세 (포함 라인 JOIN via pkg_line_map)
  - [ ] `PUT` — 상태 변경 + AuditLog
- [ ] `src/app/api/projects/[id]/packages/stats/route.ts`
  - [ ] `GET` — 패키지 통계 (시스템별, 매체별, 상태별)
- [ ] `src/app/api/projects/[id]/golden-joints/route.ts`
  - [ ] `GET` — Golden Joint 목록
- [ ] `src/app/api/projects/[id]/golden-joints/[gjId]/route.ts`
  - [ ] `PUT` — 상태 변경
- **검증**: 1,400개 패키지 API 동작

### T-027: Package 목록 + 대시보드 UI
> PRD: `[FR-301]` `[FR-303]` `[7.2]` 화면 #7
- [ ] `src/app/projects/[id]/packages/page.tsx`
- [ ] `src/components/packages/PackageList.tsx`
  - [ ] 시스템 코드별 접기/펼치기 그룹 (shadcn Accordion)
  - [ ] 각 그룹 헤더: 시스템명 + 패키지 수 + 완료율 프로그레스 바
  - [ ] 각 패키지 행: Package No, Pressure, Medium Badge, Status Badge
  - [ ] Status 변경 인라인 드롭다운: Draft→Ready→In Progress→Completed→Approved
  - [ ] 필터: 시스템, 매체, 상태
- [ ] `src/components/packages/PackageDashboard.tsx`
  - [ ] 전체 진도 프로그레스 바
  - [ ] 시스템별 진도 Stacked Bar Chart (Recharts)
  - [ ] 매체별 Donut Chart (H/V/P/S)
- **검증**: 1,400개 패키지 시스템별 그룹핑 + 차트 렌더링

### T-028: Package 상세 + Golden Joint
> PRD: `[FR-302]` `[FR-304]` `[7.2]` 화면 #8
- [ ] `src/app/projects/[id]/packages/[pkgId]/page.tsx`
  - [ ] 패키지 헤더: 번호, 압력, 매체, 상태 Badge
  - [ ] 포함 라인 목록 테이블
  - [ ] 관련 도면 페이지 링크 → 뷰어 이동
  - [ ] Golden Joint 섹션
    - [ ] 목록: 위치, 상태 워크플로우 Badge
    - [ ] 상태 변경: Identified → Welding → NDE → PWHT → Approved (스텝퍼 UI)
- **검증**: 패키지 상세 + 포함 라인 + Golden Joint 상태 변경 동작

---

### Sprint 3 완료 체크포인트
- [ ] 대시보드: 통계 카드 4개 + 차트 3개 + 유닛 요약 렌더링
- [ ] Line List: 7,000행 테이블 (필터 5종 + 정렬 + 검색 + 인라인 편집 + 벌크 편집)
- [ ] Equipment: 9,000행 테이블 (필터 + 검색)
- [ ] Package: 1,400개 그룹핑 목록 + 대시보드 차트 + 상세 뷰
- [ ] Golden Joint: 상태 워크플로우 동작
- [ ] 모든 페이지 로딩 < 3초 — PRD `[4.1]`
- [ ] 사이드바 네비게이션 전체 동작

---

# Sprint 4: 뷰어 + 보고서 + 통합 QA + 배포 (Week 7~8)

---

## 4.1 P&ID 뷰어

> PRD 참조: `[FR-401]` `[FR-402]` `[US-401~402]` `[6.8 API]` `[7.2]` 화면 #9

### T-029: P&ID 뷰어 UI
> PRD: `[FR-401]` 줌 100%~400%, 팬, 1초 이내 전환
- [ ] `src/app/projects/[id]/viewer/page.tsx`
- [ ] `src/components/viewer/PidViewer.tsx`
  - [ ] react-pdf 사용 (클라이언트 사이드 PDF 렌더링)
    - [ ] Supabase Storage에서 PDF URL 가져오기 (signed URL)
    - [ ] `<Document>` + `<Page>` 컴포넌트
  - [ ] 줌: 마우스 스크롤 / 슬라이더 / +- 버튼 (100%~400%)
  - [ ] 팬: 마우스 드래그 (CSS transform)
  - [ ] "화면 맞춤" 버튼
  - [ ] 페이지 네비게이션
    - [ ] 이전/다음 버튼
    - [ ] 페이지 번호 입력 (직접 점프)
    - [ ] "1 / 417" 표시
    - [ ] 키보드: 좌우 화살표
  - [ ] 페이지 프리로딩: 현재 +-2 페이지 미리 로드
  - [ ] 로딩 상태: 스피너
- [ ] `src/components/viewer/ViewerSearch.tsx`
  - [ ] 검색 API: Supabase에서 pipe_lines, equipment, test_packages 검색
  - [ ] `src/app/api/projects/[id]/search/route.ts`
    - [ ] `GET ?q=` → ILIKE 검색 (라인번호, 장비태그, 패키지번호)
    - [ ] 결과: `[{entityType, entityId, displayName, sourcePages}]` (최대 50건)
  - [ ] 결과 드롭다운: entity_type 아이콘 + display_name + "Page X, Y, Z"
  - [ ] 결과 클릭 → 해당 페이지로 이동
- **검증**: 417페이지 네비게이션 부드러움, 검색 → 페이지 이동

---

## 4.2 보고서 엔진

> PRD 참조: `[FR-501~504]` `[US-501~504]` `[6.7 API]` `[7.2]` 화면 #10

### T-030: 엑셀 공통 유틸 (exceljs)
- [ ] `src/lib/report/excel-generator.ts`
  - [ ] `applyHeaderStyle(worksheet, row)` — 배경색(#4472C4), 흰색 글자, 볼드, 테두리
  - [ ] `autoColumnWidth(worksheet)` — 내용 기반 열 너비 자동 조절
  - [ ] `applyFilter(worksheet)` — 첫 행 자동 필터
  - [ ] `addConditionalFormat(worksheet, col, rule)` — 조건부 서식
  - [ ] `createWorkbook()` → exceljs Workbook 인스턴스 (기본 스타일)
- **검증**: 테스트 엑셀 생성 → 서식 확인

### T-031: Line List 엑셀 출력
> PRD: `[FR-501]` 3개 시트, 조건부 서식
- [ ] `src/app/api/projects/[id]/reports/route.ts`
  - [ ] `POST` (body: { type: 'line-list' | 'equipment' | 'packages' | 'summary', filters? })
  - [ ] Line List 생성:
    - [ ] Sheet 1 "Line List": 전체 라인 테이블 (헤더 서식 + 자동 열 너비 + 필터)
      - [ ] 조건부 서식: 12" 이상 라인 → 노란 배경
    - [ ] Sheet 2 "Summary": 사이즈별/서비스별 통계표 + 차트
    - [ ] Sheet 3 "Filter Info": 필터 조건 + 생성일시 + 프로젝트명
  - [ ] 엑셀 Buffer → Supabase Storage (`reports` 버킷) 저장
  - [ ] 202 Accepted + { reportId, downloadUrl }
- [ ] `src/app/api/reports/[id]/download/route.ts`
  - [ ] `GET` — Supabase Storage signed URL 리다이렉트
- **검증**: 7,000 라인 엑셀 생성 < 10초, 3개 시트 + 서식 확인

### T-032: Equipment + Package + Summary 엑셀 출력
> PRD: `[FR-502]` `[FR-503]` `[FR-504]`
- [ ] Equipment List:
  - [ ] 컬럼: Tag No, Equipment Type, Unit, Source Drawing, Source Pages
  - [ ] 헤더 서식 + 자동 열 너비
- [ ] Test Package List:
  - [ ] Sheet 1 "Packages": Package No, System Code, Test Pressure, Test Medium, Line Count, Status
  - [ ] Sheet 2 "System Summary": 시스템별 통계
- [ ] Pipe Size Summary:
  - [ ] 사이즈별/서비스별/유닛별 통계표
  - [ ] exceljs 차트 삽입 (BarChart, PieChart)
- **검증**: 4종 엑셀 다운로드 + 열기 확인

### T-033: 보고서 출력 UI
> PRD: `[7.2]` 화면 #10
- [ ] `src/app/projects/[id]/reports/page.tsx`
  - [ ] 보고서 유형 카드 4개:
    - [ ] Line List, Equipment List, Test Packages, Pipe Size Summary
    - [ ] 각 카드: 설명, 예상 건수, "다운로드" 버튼
  - [ ] Line List 옵션: 유닛/사이즈 필터 (선택)
  - [ ] 다운로드 플로우:
    - [ ] 버튼 클릭 → POST API → 로딩 스피너
    - [ ] 완료 → 자동 다운로드 (`window.open(downloadUrl)`)
  - [ ] 에러 → 토스트 알림
- **검증**: 4종 보고서 다운로드 성공

---

## 4.3 부가 기능

### T-034: 유닛 트리 + 전역 필터
> PRD: `[FR-602]` `[US-602]`
- [ ] Supabase 쿼리: 유닛 목록 + 라인/장비/패키지 count
- [ ] `src/components/layout/UnitTree.tsx` — 사이드바에 유닛 트리
  - [ ] 유닛 선택 → URL 쿼리 `?unit=2000`
  - [ ] 전체 페이지 (Line List, Equipment, Packages, Dashboard) 유닛 필터 적용
  - [ ] "전체" 옵션 (필터 해제)
- **검증**: 유닛 선택 → 전체 데이터 필터링 동작

### T-035: 팀원 관리
> PRD: `[FR-603]` `[US-603]`
- [ ] `src/app/api/projects/[id]/members/route.ts`
  - [ ] `GET` — 멤버 목록 (profiles JOIN)
  - [ ] `POST` — 멤버 초대 (이메일 + 역할)
    - [ ] Supabase Auth에서 사용자 검색 (또는 초대 이메일 발송)
    - [ ] project_members INSERT
- [ ] `src/app/api/projects/[id]/members/[userId]/route.ts`
  - [ ] `PUT` — 역할 변경 (admin만)
  - [ ] `DELETE` — 멤버 제거 (admin만)
- [ ] `src/app/projects/[id]/settings/page.tsx`
  - [ ] 멤버 목록 테이블 (이름, 이메일, 역할)
  - [ ] 역할 변경 드롭다운 (admin만)
  - [ ] "멤버 초대" 폼
  - [ ] 멤버 제거 버튼 (확인 다이얼로그)
- **검증**: 초대 → 목록 → 역할 변경 → 제거 전체 동작

### T-036: Revision 업로드 기본
> PRD: `[FR-701]` `[US-701]`
- [ ] 업로드 API 확장: `revision` 파라미터 (선택)
- [ ] 업로드 이력에 revision 표시
- [ ] 업로드 목록 UI: 각 업로드의 revision + 파싱 상태 표시
- **검증**: 동일 프로젝트에 2개 PDF 업로드 → 이력에 표시

---

## 4.4 통합 테스트 및 QA

### T-037: End-to-End 시나리오 테스트
- [ ] 시나리오 1: 신규 사용자 플로우
  - [ ] 회원가입 → 로그인 → 프로젝트 생성 → PDF 업로드 → 파싱 완료 대기
  - [ ] 대시보드 통계 확인 → Line List 확인 → 필터 적용 → 엑셀 다운로드
  - [ ] Equipment 확인 → Package 확인 → 상태 변경
  - [ ] 뷰어에서 도면 확인 → 검색 → 페이지 이동
- [ ] 시나리오 2: 대아 P&ID Full 실제 데이터
  - [ ] 417페이지 PDF 업로드 → 전체 파싱
  - [ ] Line List: 6,000건 이상 확인
  - [ ] Equipment: 8,000건 이상 확인
  - [ ] Packages: 1,400건 이상 확인
  - [ ] 각 엑셀 보고서 다운로드 + 열기 + 내용 확인
- [ ] 시나리오 3: 에러 핸들링
  - [ ] 비-PDF 업로드 → 에러 메시지
  - [ ] 미인증 접근 → 로그인 리다이렉트
  - [ ] 존재하지 않는 프로젝트 → 404

### T-038: 정확도 검증 (수동)
- [ ] 라인 파서: 샘플 50개 수동 대조 → 정확도 90%+ 확인
- [ ] 패키지 파서: 샘플 20개 수동 대조 → 정확도 95%+ 확인
- [ ] 장비 파서: 샘플 30개 수동 대조 → 정확도 85%+ 확인
- [ ] 오류 패턴 식별 → Regex 보정 (필요 시)

### T-039: 성능 테스트
> PRD: `[4.1]` 성능 요구사항 전체 검증
- [ ] PDF 업로드: Supabase Storage 업로드 시간 측정
- [ ] 텍스트 추출 + 전체 파싱: < 300초 (Vercel Pro)
- [ ] 대시보드 로딩: < 3초 (TTFB + FCP)
- [ ] Line List 7,000행 초기 로딩: < 3초
- [ ] 뷰어 페이지 전환: < 1초
- [ ] 엑셀 생성 (7,000 라인): < 10초
- [ ] 각 항목 실측값 기록

### T-040: UI 폴리싱 + 버그 수정
- [ ] 로딩 상태: 모든 API 호출에 스켈레톤/스피너 적용
- [ ] 에러 상태: API 실패 시 사용자 친화적 메시지 (토스트)
- [ ] 빈 상태: 데이터 없을 때 안내 메시지
- [ ] 반응형: 최소 1280px에서 깨지지 않는지 확인 — PRD `[4.5]`
- [ ] 브라우저 호환성: Chrome, Edge, Firefox — PRD `[4.5]`
- [ ] 한국어 UI 텍스트 검수 — PRD `[4.6]`
- [ ] 발견된 버그 전체 수정

---

## 4.5 Vercel 배포

### T-041: Vercel Production 배포
> PRD: `[4.4]` 가용성, `[4.3]` HTTPS
- [ ] Vercel에 GitHub 레포 연결
  - [ ] Framework: Next.js 자동 감지
  - [ ] 환경변수 설정:
    - [ ] `NEXT_PUBLIC_SUPABASE_URL`
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Build Command: `pnpm build`
  - [ ] Root Directory: `.` (또는 `pid-x/`)
- [ ] `vercel.json` 설정
  - [ ] 파싱 함수 maxDuration: 300 (Pro 플랜)
  - [ ] 파싱 함수 memory: 3008 (Pro 플랜)
- [ ] Supabase 설정
  - [ ] Production URL을 Auth Redirect URL에 추가
  - [ ] CORS 설정: Vercel 도메인 허용
  - [ ] Storage CORS: Vercel 도메인 허용
- [ ] 도메인 설정 (선택): 커스텀 도메인 또는 Vercel 기본 도메인
- [ ] HTTPS 자동 적용 (Vercel 기본)
- [ ] Preview 배포: PR 생성 시 자동 Preview URL
- **검증**: Production URL에서 전체 기능 동작 확인

### T-042: 베타 테스트 준비
- [ ] Supabase Auth로 테스트 계정 5개 생성
- [ ] 대아 P&ID 샘플 데이터 사전 로딩 (선택)
- [ ] 간단 사용 가이드 작성 (1페이지 또는 앱 내 온보딩)
- [ ] 피드백 수집 방법 결정 (Google Form / 인앱 피드백)
- **검증**: 테스트 계정으로 로그인 → 전체 플로우 1회 시연 가능

---

### Sprint 4 완료 체크포인트
- [ ] P&ID 뷰어: 줌/팬/네비게이션/검색이동 동작
- [ ] 엑셀 보고서 4종 (Line/Equipment/Package/Summary) 다운로드 동작
- [ ] 유닛 트리 전역 필터 동작
- [ ] 팀원 초대/역할 관리 동작
- [ ] E2E 테스트 3개 시나리오 통과
- [ ] 정확도: 라인 90%+, 패키지 95%+, 장비 85%+
- [ ] 성능: 전체 파싱 < 300초, 페이지 로딩 < 3초, 엑셀 < 10초
- [ ] Vercel Production 배포 동작
- [ ] 베타 테스트 준비 완료

---

# MVP 최종 완료 체크리스트

## 기능 요구사항 (PRD 섹션 3)

### FR-100: PDF 업로드 및 파싱
- [ ] [FR-101] PDF 업로드 (200MB, 유효성 검증, Supabase Storage)
- [ ] [FR-102] 텍스트 추출 (pdfjs-dist, 60초 이내)
- [ ] [FR-103] 메타데이터 추출 (Drawing No, Unit, Revision)
- [ ] [FR-104] 배관 라인 추출 (정확도 90%)
- [ ] [FR-105] 장비 태그 추출 (정확도 85%)
- [ ] [FR-106] Test Package 추출 (정확도 95%)
- [ ] [FR-107] 계장 태그 추출 (정확도 80%)
- [ ] [FR-108] Golden Joint 추출

### FR-200: Line List 관리
- [ ] [FR-201] 테이블 뷰 (8컬럼, 정렬, 필터, 검색, 페이지네이션)
- [ ] [FR-202] 인라인 편집 + 벌크 편집 + AuditLog
- [ ] [FR-203] 사이즈 분석 대시보드 (차트 4종)

### FR-300: Test Package 관리
- [ ] [FR-301] 리스트 뷰 (시스템별 그룹핑, 상태 관리)
- [ ] [FR-302] 상세 뷰 (포함 라인, 관련 도면)
- [ ] [FR-303] 대시보드 (진도율, 매체별 통계)
- [ ] [FR-304] Golden Joint 관리 (상태 워크플로우)

### FR-400: P&ID 뷰어
- [ ] [FR-401] PDF 렌더링 (react-pdf 클라이언트, 줌/팬/네비게이션)
- [ ] [FR-402] 검색 및 이동 (라인/장비/패키지 → 페이지 이동)

### FR-500: 보고서
- [ ] [FR-501] Line List 엑셀 (3시트, 조건부 서식, exceljs)
- [ ] [FR-502] Equipment List 엑셀
- [ ] [FR-503] Test Package 엑셀 (2시트)
- [ ] [FR-504] Pipe Size Summary 엑셀 (차트)

### FR-600: 프로젝트 관리
- [ ] [FR-601] 프로젝트 CRUD (소프트 삭제)
- [ ] [FR-602] 유닛 관리 (자동 생성, 트리 구조)
- [ ] [FR-603] Supabase Auth + RLS 역할 관리 (Admin/Editor/Viewer)

### FR-700: Revision 관리
- [ ] [FR-701] Revision 업로드 (rev 파라미터, 이력 조회)

## 비기능 요구사항 (PRD 섹션 4)
- [ ] [4.1] 성능: 전체 파싱 < 300초, 페이지 < 3초, 뷰어 < 1초, 엑셀 < 10초
- [ ] [4.2] 확장성: 1,000페이지/200MB 단일 프로젝트 처리 가능
- [ ] [4.3] 보안: HTTPS (Vercel 자동), Supabase Auth, RLS, AuditLog
- [ ] [4.5] 호환성: Chrome/Edge/Firefox, 1280px+, .xlsx, PDF 1.4~2.0

## API 엔드포인트 (Next.js Route Handlers)
- [ ] 인증: Supabase Auth (가입, 로그인, OAuth 콜백)
- [ ] 프로젝트: CRUD + dashboard + members
- [ ] 업로드: upload, list, status, parse
- [ ] 라인: list, detail, update, bulk, stats
- [ ] 장비: list, detail, update, stats
- [ ] 패키지: list, detail, update, stats, golden-joints
- [ ] 보고서: generate (4종), download
- [ ] 뷰어: search

## 데이터 모델 (Supabase)
- [ ] 13개 테이블 + 6개 Enum (Supabase Migration 적용)
- [ ] RLS 정책 전체 적용
- [ ] 인덱스 최적화

## UI 화면 (PRD 섹션 7)
- [ ] 화면 #1: 로그인/회원가입 (Supabase Auth + Google OAuth)
- [ ] 화면 #2: 프로젝트 목록
- [ ] 화면 #3: PDF 업로드 (드래그앤드롭 + Supabase Realtime 진행률)
- [ ] 화면 #4: 프로젝트 대시보드
- [ ] 화면 #5: Line List 테이블
- [ ] 화면 #6: Equipment List 테이블
- [ ] 화면 #7: Test Package 목록
- [ ] 화면 #8: Test Package 상세
- [ ] 화면 #9: P&ID 뷰어 (react-pdf)
- [ ] 화면 #10: 보고서 출력
- [ ] 화면 #12: 설정/팀 관리

## PRD 1.4 성공 기준
- [ ] 400+ 페이지 PDF 업로드 후 5분 이내 데이터 추출 완료
- [ ] Line List 자동 추출 정확도 90% 이상
- [ ] Test Package 자동 추출 정확도 95% 이상
- [ ] 엑셀 보고서 1클릭 출력
- [ ] 베타 사용자 5명 이상 긍정적 피드백

---

## 기존 스택 대비 변경 요약

| 항목 | 기존 (FastAPI + Docker) | 변경 (Supabase + Vercel) |
|------|------------------------|--------------------------|
| Backend 언어 | Python (FastAPI) | TypeScript (Next.js Route Handlers) |
| ORM | SQLAlchemy 2.0 + Alembic | Supabase Client + SQL Migration |
| 인증 | PyJWT + bcrypt (직접 구현) | Supabase Auth (자동 관리) |
| DB | PostgreSQL (직접 운영) | Supabase PostgreSQL (관리형 + RLS) |
| 파일 저장 | S3 / MinIO | Supabase Storage |
| 작업 큐 | Celery + Redis | Vercel Serverless Function (maxDuration: 300s) |
| 실시간 | Redis Pub/Sub + SSE | Supabase Realtime (WebSocket) |
| PDF 파싱 | PyMuPDF (Python) | pdfjs-dist (Node.js) |
| 엑셀 생성 | openpyxl (Python) | exceljs (Node.js) |
| 컨테이너 | Docker + Docker Compose | 불필요 (Vercel + Supabase 관리형) |
| 리버스 프록시 | Nginx | 불필요 (Vercel CDN) |
| CI/CD | GitHub Actions | Vercel Git Integration (자동) |
| 배포 | docker-compose up | git push (자동 배포) |
| **총 태스크 수** | **64개 (T-001~T-064)** | **42개 (T-001~T-042)** |
| **개발 언어** | **Python + TypeScript** | **TypeScript 단일 언어** |
