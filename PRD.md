# PID-X Product Requirements Document (PRD)

**Version**: 1.0
**Date**: 2026-02-18
**Author**: Process Engineering Team
**Status**: Draft

---

## 1. 제품 개요

### 1.1 제품명
**PID-X** - AI 기반 P&ID 공정관리 SaaS 플랫폼

### 1.2 한 줄 정의
P&ID PDF를 업로드하면 배관/장비/계장 데이터를 자동 추출하고, Line List/Test Package/공정 스케줄/엑셀 보고서까지 원스톱으로 생성하는 웹 플랫폼.

### 1.3 제품 범위 (MVP - Phase 1)

| 포함 | 미포함 (Phase 2+) |
|------|-------------------|
| PDF 업로드 및 텍스트 기반 데이터 추출 | AI/OCR 이미지 인식 (Track B) |
| Line List 자동 생성 | MTO 자동 산출 |
| Equipment List 자동 생성 | 3D 디지털 트윈 |
| Hydro Test Package 자동 추출 | 모바일 앱 |
| 배관 사이즈 분석 대시보드 | AI 설계 검증 |
| P&ID 뷰어 (줌/팬/네비게이션) | AI 챗봇 어시스턴트 |
| Red-Line Revision 추적 | ERP/SAP 연동 |
| 엑셀/PDF 보고서 출력 | Primavera 연동 |
| 프로젝트/유닛 관리 | 실시간 협업 편집 |
| 사용자 인증 및 권한 관리 | 온프레미스 배포 |

### 1.4 성공 기준 (MVP)
- P&ID Full PDF(400+ 페이지) 업로드 후 5분 이내 데이터 추출 완료
- Line List 자동 추출 정확도 90% 이상
- Test Package 자동 추출 정확도 95% 이상
- 엑셀 보고서 1클릭 출력
- 베타 사용자 5명 이상의 긍정적 피드백

---

## 2. 사용자 정의

### 2.1 페르소나

#### P1: 배관 시공 PM (Primary)
- **이름**: 김철수 (30년 경력)
- **역할**: 현장 배관 시공 관리 총괄
- **현재 고충**: P&ID 수백 장을 수작업으로 분석, 엑셀로 Line List 정리, Test Package 수기 관리
- **핵심 니즈**: "P&ID만 올리면 Line List, Test Package가 자동으로 나왔으면"
- **기술 수준**: 엑셀 상급, 웹앱 중급, 프로그래밍 불가

#### P2: 설계 엔지니어 (Secondary)
- **이름**: 박영희 (15년 경력)
- **역할**: P&ID 설계 및 검토
- **현재 고충**: Revision 관리 혼란, 변경 영향 분석 수작업
- **핵심 니즈**: "Rev 간 뭐가 바뀌었는지 한눈에 보고 싶다"
- **기술 수준**: SmartPlant/AutoCAD 상급, 웹앱 상급

#### P3: QC/검사 엔지니어 (Secondary)
- **이름**: 이준혁 (10년 경력)
- **역할**: 용접 검사, Hydro Test 관리
- **현재 고충**: Test Package 목록 수기 관리, Golden Joint 추적 어려움
- **핵심 니즈**: "Test Package 현황을 실시간으로 보고 싶다"
- **기술 수준**: 엑셀 중급, 웹앱 중급

### 2.2 사용자 스토리

#### Epic 1: PDF 업로드 및 데이터 추출
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-101 | PM으로서 P&ID PDF를 업로드하여 프로젝트를 생성하고 싶다 | P0 | 최대 200MB PDF 업로드, 프로젝트명/유닛 자동 인식 |
| US-102 | PM으로서 업로드된 PDF에서 자동으로 모든 배관 라인이 추출되기를 원한다 | P0 | 라인번호, 사이즈, 서비스코드, Spec Class 추출 |
| US-103 | PM으로서 업로드된 PDF에서 자동으로 모든 장비 태그가 추출되기를 원한다 | P0 | 장비 태그, 장비 타입 분류 |
| US-104 | PM으로서 업로드된 PDF에서 Hydro Test Package가 자동 추출되기를 원한다 | P0 | Package No, Test Pressure, Test Medium 추출 |
| US-105 | PM으로서 추출 진행률을 실시간으로 확인하고 싶다 | P1 | 프로그레스 바, 현재 처리 페이지 표시 |
| US-106 | PM으로서 추출된 데이터를 검증하고 수정할 수 있어야 한다 | P1 | 인라인 편집, 수동 추가/삭제 |

#### Epic 2: Line List 관리
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-201 | PM으로서 자동 생성된 Line List를 테이블 형태로 보고 싶다 | P0 | 정렬, 필터, 검색 기능 포함 |
| US-202 | PM으로서 Line List를 사이즈/서비스/Spec별로 필터링하고 싶다 | P0 | 다중 조건 필터, 필터 저장 |
| US-203 | PM으로서 배관 사이즈 분포를 차트로 보고 싶다 | P1 | 파이 차트, 바 차트 |
| US-204 | PM으로서 Line List를 엑셀로 다운로드하고 싶다 | P0 | .xlsx 형식, 서식 포함 |

#### Epic 3: Test Package 관리
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-301 | QC로서 전체 Test Package 목록을 한눈에 보고 싶다 | P0 | 시스템별/매체별 그룹핑 |
| US-302 | QC로서 각 Test Package의 시험 진도를 관리하고 싶다 | P1 | 상태: 대기/준비중/시험중/완료/보류 |
| US-303 | QC로서 Test Package별 포함 라인 목록을 확인하고 싶다 | P1 | Package ↔ Line 매핑 뷰 |
| US-304 | QC로서 Test Package 현황을 시스템별 대시보드로 보고 싶다 | P1 | 진도율 차트, 시험매체별 통계 |
| US-305 | QC로서 Golden Joint 목록을 별도로 관리하고 싶다 | P1 | 위치, 관련 패키지, 상태 추적 |

#### Epic 4: P&ID 뷰어
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-401 | 엔지니어로서 P&ID 도면을 웹에서 줌/팬하며 볼 수 있어야 한다 | P0 | 부드러운 줌/팬, 페이지 네비게이션 |
| US-402 | 엔지니어로서 도면에서 특정 라인/장비를 검색하여 위치로 이동하고 싶다 | P1 | 검색 → 해당 페이지 자동 이동 |
| US-403 | 엔지니어로서 도면 위에 Test Boundary를 색상 오버레이로 보고 싶다 | P2 | 패키지별 색상 구분 |
| US-404 | 엔지니어로서 서로 다른 Revision의 도면을 비교하고 싶다 | P2 | Side-by-side 또는 Diff 오버레이 |

#### Epic 5: 보고서 출력
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-501 | PM으로서 Line List를 업계 표준 엑셀 양식으로 출력하고 싶다 | P0 | 헤더, 서식, 조건부 서식 포함 |
| US-502 | PM으로서 Equipment List를 엑셀로 출력하고 싶다 | P0 | 장비 태그, 타입, 도면번호 포함 |
| US-503 | PM으로서 Test Package List를 엑셀로 출력하고 싶다 | P0 | 패키지번호, 압력, 매체, 상태 포함 |
| US-504 | PM으로서 배관 사이즈 분포 요약 보고서를 출력하고 싶다 | P1 | 차트 + 통계표 포함 PDF |
| US-505 | PM으로서 출력 양식 템플릿을 커스터마이징하고 싶다 | P2 | 열 추가/삭제, 로고 삽입 |

#### Epic 6: 프로젝트 관리
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-601 | PM으로서 여러 프로젝트를 생성/관리하고 싶다 | P0 | 프로젝트 CRUD |
| US-602 | PM으로서 프로젝트 내에서 유닛별로 도면을 구분하고 싶다 | P1 | 유닛 트리 네비게이션 |
| US-603 | 관리자로서 팀원을 초대하고 역할별 권한을 설정하고 싶다 | P1 | Admin/Editor/Viewer 역할 |
| US-604 | PM으로서 프로젝트 전체 현황을 대시보드로 보고 싶다 | P1 | 추출 현황, 라인/장비/패키지 통계 |

#### Epic 7: Revision 관리
| ID | 사용자 스토리 | 우선순위 | 수용 기준 |
|----|-------------|---------|----------|
| US-701 | 엔지니어로서 동일 도면의 여러 Revision을 관리하고 싶다 | P1 | Rev 업로드, 이력 조회 |
| US-702 | 엔지니어로서 Revision 간 변경된 라인/장비를 자동 식별하고 싶다 | P2 | 텍스트 기반 Diff 분석 |
| US-703 | 엔지니어로서 Change Notice 번호와 연결하여 변경사유를 관리하고 싶다 | P2 | CN 번호 태깅 |

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 FR-100: PDF 업로드 및 파싱 엔진

#### FR-101: PDF 업로드
- **설명**: 사용자가 P&ID PDF 파일을 웹 브라우저에서 업로드
- **입력**: PDF 파일 (최대 200MB, 최대 1,000페이지)
- **처리**:
  1. 파일 유효성 검증 (PDF 포맷, 크기 제한)
  2. Supabase Storage 저장
  3. 파싱 API Route 호출
- **출력**: 업로드 확인, 작업 ID 반환
- **에러 처리**: 파일 크기 초과, 잘못된 포맷, 업로드 중단 시 재시작

#### FR-102: PDF 텍스트 추출 (Track A - 텍스트 기반)
- **설명**: 텍스트 레이어가 포함된 PDF에서 페이지별 텍스트 추출
- **기술**: pdfjs-dist (Node.js) 라이브러리
- **처리**:
  1. 페이지 수 확인 및 텍스트 존재 여부 판별
  2. 페이지 단위 텍스트 추출
  3. 추출된 텍스트를 페이지별로 Supabase DB 저장
- **성능 요구사항**: 417페이지 PDF → 60초 이내 텍스트 추출 완료
- **텍스트 없는 PDF**: "이미지 전용 PDF입니다. Track B(AI OCR) 기능이 필요합니다" 안내

#### FR-103: 도면 메타데이터 추출
- **설명**: 각 페이지에서 도면 메타데이터 자동 인식
- **추출 항목**:

| 필드 | 추출 패턴 | 예시 |
|------|----------|------|
| Drawing No. | `A8RX-CHT-XXXX-PRC-PID-XXX` | A8RX-CHT-2000-PRC-PID-101 |
| Project Name | 타이틀 블록 영역 텍스트 | PKN ORLEN OLEFINS EXPANSION PROJECT |
| Unit No. | 도면번호 내 4자리 | 2000, 2100, 2200 |
| Revision | `Rev.\w+` 또는 `ISSUED FOR...` | Rev.2C, ISSUED FOR CONSTRUCTION |
| Rev Date | 날짜 패턴 | 13-DEC-24 |
| Sheet Title | PID 번호 뒤 설명 | GASOLINE STRIPPER AND REBOILER |

#### FR-104: 배관 라인 번호 추출
- **설명**: 텍스트에서 배관 라인 번호를 정규식으로 추출
- **라인번호 구조**: `[SIZE]-[SERVICE]-[NUMBER]-[SPEC CLASS]`
- **추출 패턴 (Regex)**:
  ```
  (\d{1,2})\s*["']\s*-?\s*([A-Z]{2,4})\s*-\s*(\d{3,5})\s*-?\s*([A-Z0-9]{2,8})?
  ```
- **파싱 결과 매핑**:
  | 그룹 | 필드 | 예시 |
  |------|------|------|
  | Group 1 | Nominal Size | 6 → 6" |
  | Group 2 | Service Code | P (Process), SG (Steam Gen), CW (Cooling Water) |
  | Group 3 | Line Number | 0031 |
  | Group 4 | Spec Class | 01SA0S04, 12CB1S01 |
- **중복 제거**: 동일 라인번호가 여러 페이지에 나타나면 하나로 통합, 출현 페이지 목록 기록
- **정확도 목표**: 90% (수동 검증 대비)

#### FR-105: 장비 태그 추출
- **설명**: 텍스트에서 장비 태그를 정규식으로 추출
- **태그 패턴**: `[EQUIPMENT TYPE PREFIX]-[NUMBER][SUFFIX]`
- **장비 타입 분류**:

| Prefix | 장비 타입 | 예시 |
|--------|----------|------|
| V- | Vessel | V-2001 |
| E- | Heat Exchanger | E-2003A |
| P- | Pump | P-2005A/B |
| C- | Compressor | C-2101 |
| T- | Tower/Column | T-2201 |
| D- | Drum | D-2501 |
| F- | Furnace/Fired Heater | F-2101 |
| R- | Reactor | R-2001 |
| AE- | Air-cooled Exchanger | AE-0001A |
| AD- | Air Dryer | AD-2601 |

- **중복 제거**: 동일 태그 통합, 출현 페이지 기록
- **정확도 목표**: 85% (다양한 태그 패턴 고려)

#### FR-106: Hydro Test Package 추출
- **설명**: 텍스트에서 Test Package 정보를 정규식으로 추출
- **추출 패턴**:
  ```
  Package\s*no\.?:\s*([\w-]+)\s*
  Test\s*Pressure:\s*([\d.]+\s*(?:Bar|barg|psig|NA))\s*
  Test\s*Medium:\s*([HVPS])
  ```
- **추출 결과**:

| 필드 | 타입 | 예시 |
|------|------|------|
| package_no | string | 2000E-P-0003 |
| test_pressure | string | 21 Bar |
| test_medium | enum(H,V,P,S) | H |
| source_page | int | 201 |
| system_code | string (패키지번호에서 파싱) | P |

- **정확도 목표**: 95% (구조화된 패턴)

#### FR-107: 계장 태그 추출
- **설명**: 계장 태그 추출
- **패턴**: `[FUNCTION LETTER(S)]-[NUMBER]`
- **Function Letter 분류**: F(Flow), T(Temperature), P(Pressure), L(Level), A(Analyzer)
- **정확도 목표**: 80%

#### FR-108: Golden Joint 추출
- **설명**: "Golden Joint" 텍스트 키워드 인접 데이터 추출
- **추출**: 페이지 번호, 인접 라인번호, 인접 장비태그

### 3.2 FR-200: Line List 관리

#### FR-201: Line List 테이블 뷰
- **설명**: 추출된 배관 라인을 테이블로 표시
- **컬럼**:
  | 컬럼명 | 타입 | 정렬 | 필터 |
  |--------|------|:---:|:---:|
  | Line Number | string | Y | Y |
  | Nominal Size | string | Y | Y (다중선택) |
  | Service Code | string | Y | Y (다중선택) |
  | Spec Class | string | Y | Y |
  | Unit | string | Y | Y (다중선택) |
  | Source Drawing | string | Y | Y |
  | Source Pages | string[] | - | - |
  | Status | enum | Y | Y |
- **페이지네이션**: 기본 50행, 100/200/500 선택 가능
- **검색**: 전체 텍스트 검색 + 컬럼별 필터

#### FR-202: Line List 인라인 편집
- **설명**: 테이블에서 직접 셀 편집
- **편집 가능 필드**: Nominal Size, Service Code, Spec Class, Status
- **변경 이력**: 수정 시각, 수정자, 이전 값 기록
- **벌크 편집**: 다중 행 선택 후 일괄 수정

#### FR-203: 배관 사이즈 분석 대시보드
- **차트 1**: 사이즈별 라인 수 (Bar Chart)
- **차트 2**: 서비스 코드별 라인 수 (Pie Chart)
- **차트 3**: 유닛별 라인 수 (Stacked Bar Chart)
- **차트 4**: 사이즈 × 서비스 매트릭스 (Heatmap)
- **인터랙션**: 차트 클릭 → 해당 라인 목록으로 드릴다운

### 3.3 FR-300: Test Package 관리

#### FR-301: Test Package 리스트 뷰
- **컬럼**: Package No, System Code, Test Pressure, Test Medium, 포함 라인 수, Status, Progress
- **그룹핑**: 시스템 코드별 접기/펼치기
- **상태 관리**: Draft → Ready → In Progress → Completed → Approved

#### FR-302: Test Package 상세 뷰
- **패키지 정보**: 번호, 압력, 매체, 상태
- **포함 라인 목록**: 해당 패키지에 속한 배관 라인들
- **관련 도면**: 해당 패키지가 표시된 P&ID 페이지 링크
- **Golden Joint**: 해당 패키지 내 Golden Joint 목록

#### FR-303: Test Package 대시보드
- **전체 진도**: 완료/전체 비율 (프로그레스 바)
- **시스템별 진도**: 각 시스템 코드별 완료율
- **매체별 통계**: H/V/P/S 분포 (Donut Chart)
- **일정 현황**: 이번 주/이번 달 시험 예정 패키지

#### FR-304: Golden Joint 관리
- **리스트 뷰**: 위치, 관련 패키지, 상태
- **상태 워크플로우**: Identified → Welding → NDE → PWHT → Approved
- **알림**: 상태 변경 시 관련자 알림

### 3.4 FR-400: P&ID 뷰어

#### FR-401: PDF 렌더링
- **기술**: react-pdf (PDF.js) 클라이언트 사이드 렌더링 + Supabase Storage 직접 로딩
- **기능**: 줌(100%~400%), 팬(드래그), 페이지 네비게이션
- **성능**: 417페이지 PDF에서 페이지 전환 1초 이내

#### FR-402: 검색 및 이동
- **검색 입력**: 라인번호, 장비태그, 패키지번호
- **결과**: 해당 아이템이 존재하는 페이지 목록
- **이동**: 결과 클릭 시 해당 페이지로 즉시 이동

#### FR-403: Revision 비교 (P2)
- **방식**: 두 Revision PDF 업로드 → 페이지별 텍스트 Diff
- **표시**: 추가/삭제/변경된 라인/장비 하이라이트 목록

### 3.5 FR-500: 보고서 엔진

#### FR-501: 엑셀 출력 - Line List
- **파일**: `.xlsx`
- **시트 구성**:
  - Sheet 1: "Line List" - 전체 라인 테이블
  - Sheet 2: "Summary" - 사이즈/서비스별 통계
  - Sheet 3: "Filter Info" - 적용된 필터 조건
- **서식**: 헤더 배경색, 테두리, 자동 열 너비, 필터 설정
- **조건부 서식**: 대구경(12"+) 라인 강조, 특수 서비스 코드 색상 구분

#### FR-502: 엑셀 출력 - Equipment List
- **컬럼**: Tag No, Equipment Type, Unit, Source Drawing, Source Pages

#### FR-503: 엑셀 출력 - Test Package List
- **컬럼**: Package No, System Code, Test Pressure, Test Medium, Line Count, Status
- **시트 2**: 시스템별 요약 통계

#### FR-504: 엑셀 출력 - Pipe Size Summary
- **통계**: 사이즈별 라인 수, 서비스별 라인 수, 유닛별 라인 수
- **차트**: 엑셀 내장 차트 포함

#### FR-505: PDF 출력 - 프로젝트 요약 보고서
- **내용**: 프로젝트 개요, 도면 수, 라인/장비/패키지 통계, 차트
- **형식**: A4 세로, 회사 로고 영역

### 3.6 FR-600: 프로젝트 관리

#### FR-601: 프로젝트 CRUD
- **생성**: 프로젝트명, 설명, 클라이언트명
- **프로젝트 속성**: 자동 인식 (도면에서 추출) + 수동 편집
- **삭제**: 소프트 삭제 (30일 보관 후 영구 삭제)

#### FR-602: 유닛 관리
- **자동 생성**: 도면번호에서 유닛 코드 파싱하여 유닛 자동 생성
- **트리 구조**: Project → Unit → Drawing 계층
- **유닛간 참조**: Tie-in Point 표시 (크로스 유닛 라인 필터)

#### FR-603: 사용자 및 권한
- **인증**: Supabase Auth (이메일/비밀번호 + Google OAuth + Magic Link)
- **역할**:
  | 역할 | 프로젝트 관리 | 데이터 편집 | 보고서 출력 | 데이터 조회 |
  |------|:---:|:---:|:---:|:---:|
  | Admin | O | O | O | O |
  | Editor | X | O | O | O |
  | Viewer | X | X | O | O |
- **접근 제어**: Supabase RLS (Row Level Security) 정책으로 DB 레벨 접근 제어
- **초대**: 이메일 초대 링크 (Supabase Auth invite)

### 3.7 FR-700: Revision 관리

#### FR-701: Revision 업로드
- **방식**: 동일 프로젝트에 새 PDF 업로드 시 Revision 선택
- **메타데이터**: Rev 번호, 발행일, 발행 사유 (IFC, AFC, Red-Line 등)
- **자동 감지**: 도면 텍스트에서 ISSUED FOR... 패턴으로 Rev 타입 자동 인식

#### FR-702: Revision 이력
- **타임라인**: 각 도면의 Rev 이력을 시간순 표시
- **변경 요약**: Rev 간 추가/삭제/변경된 라인 수, 장비 수 표시

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 성능 (Performance)

| 항목 | 요구사항 | 측정 방법 |
|------|---------|----------|
| PDF 업로드 | 200MB 파일 60초 이내 업로드 | 네트워크 50Mbps 기준 |
| 텍스트 추출 | 417페이지 60초 이내 완료 | 서버 처리 시간 |
| 데이터 파싱 | 추출 후 120초 이내 전체 파싱 완료 | Regex 처리 시간 |
| 페이지 로드 | 대시보드 3초 이내 초기 로딩 | TTFB + FCP |
| 뷰어 성능 | 페이지 전환 1초 이내 | 이미지 로딩 시간 |
| 엑셀 생성 | 7,000 라인 기준 10초 이내 | 파일 생성 시간 |
| 동시 사용자 | 50명 동시 접속 | 응답 시간 유지 |

### 4.2 확장성 (Scalability)
- 단일 프로젝트: 최대 1,000페이지, 200MB
- 프로젝트 수: 사용자당 최대 50개
- 총 저장량: 테넌트당 50GB
- 향후: 수평 확장 가능한 아키텍처 (Stateless API + 메시지 큐)

### 4.3 보안 (Security)
- **데이터 전송**: HTTPS (TLS 1.3, Vercel + Supabase 자동 적용)
- **데이터 저장**: AES-256 암호화 (at-rest, Supabase 기본 제공)
- **인증**: Supabase Auth (JWT 기반, 자동 세션 관리, OAuth 지원)
- **권한**: RLS (Row Level Security) + RBAC (Role-Based Access Control)
- **파일 격리**: Supabase Storage RLS 정책 (프로젝트별 접근 제어)
- **감사 로그**: 모든 데이터 변경/조회 이력 기록

### 4.4 가용성 (Availability)
- **SLA**: 99.5% (Vercel 99.99% + Supabase Pro 99.9%)
- **배포**: Vercel 자동 배포 (Git Push → Preview → Production)
- **백업**: Supabase 자동 백업 (일일, Pro 플랜 Point-in-time Recovery)

### 4.5 호환성 (Compatibility)
- **브라우저**: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+
- **PDF 포맷**: PDF 1.4~2.0, 텍스트 레이어 포함 PDF (MVP)
- **엑셀 출력**: .xlsx (Excel 2007+)
- **반응형**: 최소 1280px 너비 (데스크톱 전용 MVP)

### 4.6 국제화 (i18n)
- **MVP**: 한국어 + 영어
- **Phase 2**: 아랍어, 러시아어, 폴란드어 추가

---

## 5. 데이터 모델

### 5.1 ERD (핵심 엔터티)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Project    │────<│    Unit      │────<│   Drawing    │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)     │     │ id (PK)      │     │ id (PK)      │
│ name        │     │ project_id   │     │ unit_id      │
│ client      │     │ code (2000)  │     │ drawing_no   │
│ description │     │ name         │     │ title        │
│ created_at  │     │ created_at   │     │ revision     │
│ updated_at  │     └──────────────┘     │ rev_date     │
│ owner_id    │                          │ page_start   │
└─────────────┘                          │ page_end     │
                                         └──────────────┘
                                                │
                    ┌───────────────────────────┤
                    │                           │
          ┌────────▼───────┐         ┌─────────▼──────┐
          │   PipeLine     │         │  Equipment     │
          ├────────────────┤         ├────────────────┤
          │ id (PK)        │         │ id (PK)        │
          │ project_id     │         │ project_id     │
          │ line_number    │         │ tag_no         │
          │ nominal_size   │         │ equip_type     │
          │ service_code   │         │ unit_id        │
          │ spec_class     │         │ source_pages   │
          │ unit_id        │         │ created_at     │
          │ source_pages   │         └────────────────┘
          │ status         │
          │ created_at     │
          └────────────────┘
                    │
          ┌────────▼───────┐         ┌────────────────┐
          │ TestPackage    │────<    │  GoldenJoint   │
          ├────────────────┤         ├────────────────┤
          │ id (PK)        │         │ id (PK)        │
          │ project_id     │         │ project_id     │
          │ package_no     │         │ test_package_id│
          │ system_code    │         │ source_page    │
          │ test_pressure  │         │ related_lines  │
          │ test_medium    │         │ status         │
          │ source_page    │         │ created_at     │
          │ status         │         └────────────────┘
          │ created_at     │
          └────────────────┘
                    │
          ┌────────▼───────┐
          │ PkgLineMap     │  (M:N 매핑)
          ├────────────────┤
          │ package_id     │
          │ pipeline_id    │
          └────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     User        │────<│  ProjectMember  │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ user_id         │
│ email           │     │ project_id      │
│ name            │     │ role            │
│ password_hash   │     │ invited_at      │
│ created_at      │     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   Instrument    │     │   PdfUpload     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ project_id      │     │ project_id      │
│ tag_no          │     │ filename        │
│ function_type   │     │ file_size       │
│ unit_id         │     │ storage_path    │
│ source_pages    │     │ total_pages     │
│ created_at      │     │ parse_status    │
└─────────────────┘     │ revision        │
                        │ uploaded_at     │
┌─────────────────┐     │ uploaded_by     │
│  PageText       │     └─────────────────┘
├─────────────────┤
│ id (PK)         │
│ upload_id       │
│ page_number     │
│ raw_text        │
│ drawing_id      │
│ extracted_at    │
└─────────────────┘

┌─────────────────┐
│  AuditLog       │
├─────────────────┤
│ id (PK)         │
│ user_id         │
│ project_id      │
│ action          │
│ entity_type     │
│ entity_id       │
│ old_value       │
│ new_value       │
│ timestamp       │
└─────────────────┘
```

### 5.2 주요 Enum 정의

```typescript
// PostgreSQL Enum (Supabase Migration) + TypeScript 타입

export type TestMedium = 'H' | 'V' | 'P' | 'S';
// H=Hydrostatic, V=Vacuum, P=Pneumatic, S=Special

export type PackageStatus = 'draft' | 'ready' | 'in_progress' | 'completed' | 'approved';

export type GoldenJointStatus = 'identified' | 'welding' | 'nde' | 'pwht' | 'approved';

export type ParseStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ProjectRole = 'admin' | 'editor' | 'viewer';

export type LineStatus = 'extracted' | 'verified' | 'modified';
```

> **Note**: Enum은 Supabase Migration에서 PostgreSQL `CREATE TYPE`으로 정의하고,
> TypeScript 타입으로 프론트엔드/API에서 동기화합니다.

---

## 6. API 설계 (REST API — Next.js Route Handlers)

> **구현 방식**: 모든 API는 Next.js App Router의 Route Handler (`/app/api/*/route.ts`)로 구현.
> 인증은 Supabase Auth가 관리하며, 서버사이드에서 `createServerClient()`로 세션 검증.

### 6.1 인증 (Supabase Auth 관리)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 (Supabase Auth signUp) |
| POST | `/api/auth/login` | 로그인 (Supabase Auth signInWithPassword) |
| POST | `/api/auth/refresh` | 토큰 갱신 (Supabase Auth 자동 관리) |
| GET | `/api/auth/me` | 현재 사용자 정보 (Supabase getUser) |
| POST | `/api/auth/oauth` | Google OAuth 리다이렉트 (Supabase signInWithOAuth) |

### 6.2 프로젝트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 상세 |
| PUT | `/api/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/projects/:id` | 프로젝트 삭제 |
| GET | `/api/projects/:id/dashboard` | 프로젝트 대시보드 통계 |
| POST | `/api/projects/:id/members` | 팀원 초대 |

### 6.3 PDF 업로드 및 파싱

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/projects/:id/uploads` | PDF 업로드 (multipart) |
| GET | `/api/projects/:id/uploads` | 업로드 이력 |
| GET | `/api/uploads/:id/status` | 파싱 진행 상태 (Supabase Realtime) |
| POST | `/api/uploads/:id/reparse` | 재파싱 요청 |

### 6.4 Line List

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/:id/lines` | 라인 목록 (필터/정렬/페이지네이션) |
| GET | `/api/projects/:id/lines/:lineId` | 라인 상세 |
| PUT | `/api/projects/:id/lines/:lineId` | 라인 수정 |
| PATCH | `/api/projects/:id/lines/bulk` | 벌크 수정 |
| GET | `/api/projects/:id/lines/stats` | 라인 통계 (사이즈/서비스별) |

### 6.5 Equipment

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/:id/equipment` | 장비 목록 |
| GET | `/api/projects/:id/equipment/:eqId` | 장비 상세 |
| PUT | `/api/projects/:id/equipment/:eqId` | 장비 수정 |
| GET | `/api/projects/:id/equipment/stats` | 장비 통계 |

### 6.6 Test Package

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/:id/packages` | 패키지 목록 |
| GET | `/api/projects/:id/packages/:pkgId` | 패키지 상세 (포함 라인 포함) |
| PUT | `/api/projects/:id/packages/:pkgId` | 패키지 수정 (상태 변경) |
| GET | `/api/projects/:id/packages/stats` | 패키지 통계 |
| GET | `/api/projects/:id/golden-joints` | Golden Joint 목록 |
| PUT | `/api/projects/:id/golden-joints/:gjId` | Golden Joint 상태 수정 |

### 6.7 보고서

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/projects/:id/reports/line-list` | Line List 엑셀 생성 |
| POST | `/api/projects/:id/reports/equipment` | Equipment List 엑셀 생성 |
| POST | `/api/projects/:id/reports/packages` | Test Package 엑셀 생성 |
| POST | `/api/projects/:id/reports/summary` | 요약 보고서 PDF 생성 |
| GET | `/api/reports/:reportId/download` | 보고서 다운로드 |

### 6.8 P&ID 뷰어

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/uploads/:id/pages/:pageNum/image` | 페이지 이미지 (react-pdf 클라이언트 렌더링) |
| GET | `/api/uploads/:id/pages/:pageNum/text` | 페이지 텍스트 |
| GET | `/api/projects/:id/search?q=` | 라인/장비/패키지 전체 검색 |

---

## 7. UI/UX 와이어프레임 (핵심 화면)

### 7.1 화면 구성

```
┌─────────────────────────────────────────────────────────────┐
│  PID-X  │ Projects ▼ │ [Search...]         │ [User] │ [⚙]  │
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│ 📁 프로젝트A │                                               │
│  ├ Unit-2000 │  ┌──────────────────────────────────────┐    │
│  ├ Unit-2100 │  │         MAIN CONTENT AREA            │    │
│  ├ Unit-2200 │  │                                      │    │
│  └ Unit-2500 │  │  (Dashboard / LineList / Packages /  │    │
│              │  │   Viewer / Reports)                  │    │
│ 📊 Dashboard │  │                                      │    │
│ 📋 Line List │  │                                      │    │
│ 🔧 Equipment │  │                                      │    │
│ 📦 Packages  │  │                                      │    │
│ 👁 Viewer    │  │                                      │    │
│ 📄 Reports   │  │                                      │    │
│ ⚙ Settings  │  └──────────────────────────────────────┘    │
│              │                                               │
└────────┴────────────────────────────────────────────────────┘
```

### 7.2 핵심 화면 목록

| # | 화면 | 주요 기능 | 우선순위 |
|---|------|----------|---------|
| 1 | 로그인/회원가입 | 이메일 인증, Google OAuth | P0 |
| 2 | 프로젝트 목록 | 프로젝트 카드, 생성 버튼 | P0 |
| 3 | PDF 업로드 | 드래그앤드롭, 진행률 표시 | P0 |
| 4 | 프로젝트 대시보드 | 통계 카드, 차트, 최근 활동 | P0 |
| 5 | Line List 테이블 | 필터, 정렬, 검색, 인라인 편집 | P0 |
| 6 | Equipment List 테이블 | 필터, 정렬, 검색 | P0 |
| 7 | Test Package 목록 | 그룹핑, 상태 관리 | P0 |
| 8 | Test Package 상세 | 포함 라인, Golden Joint | P1 |
| 9 | P&ID 뷰어 | 줌/팬, 검색 이동 | P0 |
| 10 | 보고서 출력 | 유형 선택, 옵션 설정, 다운로드 | P0 |
| 11 | Revision 관리 | 이력, Diff 뷰 | P2 |
| 12 | 설정/팀 관리 | 팀원 초대, 권한 설정 | P1 |

---

## 8. 기술 아키텍처

### 8.1 시스템 구성도

```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Next.js 15 App                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │   Pages      │  │ API Routes   │  │  Serverless   │  │ │
│  │  │  (SSR/CSR)   │  │ (Route       │  │  Functions    │  │ │
│  │  │              │  │  Handlers)   │  │  (PDF Parse)  │  │ │
│  │  └──────────────┘  └──────┬───────┘  └──────┬────────┘  │ │
│  └───────────────────────────┼──────────────────┼───────────┘ │
│               Vercel CDN     │                  │             │
│              (Edge Cache)    │                  │             │
└──────────────────────────────┼──────────────────┼─────────────┘
                               │                  │
                    ┌──────────▼──────────────────▼──────────┐
                    │              Supabase                    │
                    │  ┌──────────────┐  ┌──────────────────┐ │
                    │  │ PostgreSQL   │  │  Supabase Auth   │ │
                    │  │ (+ RLS)      │  │  (JWT/OAuth)     │ │
                    │  └──────────────┘  └──────────────────┘ │
                    │  ┌──────────────┐  ┌──────────────────┐ │
                    │  │  Storage     │  │   Realtime       │ │
                    │  │  (PDF/Excel) │  │  (진행률 Push)    │ │
                    │  └──────────────┘  └──────────────────┘ │
                    └─────────────────────────────────────────┘

┌──────────┐
│ Browser  │──── HTTPS ────▶ Vercel (Next.js)
│ (Client) │◀── SSR/API ───── ↕ Supabase Client
│          │◀── Realtime ──── Supabase Realtime (WebSocket)
└──────────┘
```

### 8.2 기술 스택 확정

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | Next.js 15 + TypeScript | App Router, SSR/CSR |
| **UI 라이브러리** | shadcn/ui + Tailwind CSS v4 | Radix UI 기반 |
| **차트** | Recharts | 2.x |
| **테이블** | TanStack Table | 8.x |
| **PDF 뷰어** | react-pdf (PDF.js 래퍼) | 클라이언트 사이드 렌더링 |
| **Backend API** | Next.js Route Handlers | /app/api/* |
| **PDF 파싱** | pdfjs-dist (Node.js) | 서버사이드 텍스트 추출 |
| **엑셀 생성** | exceljs | Node.js, 서식/차트 지원 |
| **Database** | Supabase PostgreSQL | RLS, 자동 백업 |
| **인증** | Supabase Auth | Email/PW, Google OAuth, Magic Link |
| **파일 저장** | Supabase Storage | PDF/Excel 파일, RLS 정책 |
| **실시간** | Supabase Realtime | 파싱 진행률 WebSocket Push |
| **배포** | Vercel | Git Push → 자동 배포, Preview URL |
| **CI/CD** | Vercel + GitHub Integration | PR Preview, Production 자동 배포 |
| **패키지 매니저** | pnpm | 빠른 설치, 디스크 효율 |

### 8.3 디렉토리 구조

```
pid-x/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 (로그인/회원가입)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── projects/                 # 프로젝트
│   │   │   ├── page.tsx              # 프로젝트 목록
│   │   │   └── [id]/
│   │   │       ├── layout.tsx        # 사이드바 레이아웃
│   │   │       ├── page.tsx          # 대시보드
│   │   │       ├── lines/page.tsx    # Line List
│   │   │       ├── equipment/page.tsx
│   │   │       ├── packages/
│   │   │       │   ├── page.tsx      # 패키지 목록
│   │   │       │   └── [pkgId]/page.tsx
│   │   │       ├── viewer/page.tsx   # P&ID 뷰어
│   │   │       ├── reports/page.tsx  # 보고서
│   │   │       ├── upload/page.tsx   # PDF 업로드
│   │   │       └── settings/page.tsx # 설정/팀
│   │   ├── api/                      # Route Handlers (Backend API)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts          # GET(목록), POST(생성)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET, PUT, DELETE
│   │   │   │       ├── dashboard/route.ts
│   │   │   │       ├── members/route.ts
│   │   │   │       ├── uploads/route.ts
│   │   │   │       ├── lines/route.ts
│   │   │   │       ├── equipment/route.ts
│   │   │   │       ├── packages/route.ts
│   │   │   │       └── reports/route.ts
│   │   │   ├── uploads/[id]/
│   │   │   │   ├── status/route.ts   # 파싱 상태
│   │   │   │   └── parse/route.ts    # 파싱 실행
│   │   │   └── reports/[id]/
│   │   │       └── download/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                  # 랜딩 → /projects 리다이렉트
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── layout/                   # 사이드바, 헤더, 유닛 트리
│   │   ├── dashboard/                # 통계 카드, 차트
│   │   ├── line-list/                # 테이블, 필터, 인라인 편집
│   │   ├── equipment/                # 장비 테이블
│   │   ├── packages/                 # 패키지 목록, 대시보드, 상세
│   │   ├── viewer/                   # P&ID 뷰어, 검색
│   │   └── reports/                  # 보고서 카드
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │   │   ├── server.ts             # 서버용 Supabase 클라이언트
│   │   │   └── middleware.ts         # Auth 세션 갱신
│   │   ├── parser/                   # PDF 파싱 엔진 (서버 전용)
│   │   │   ├── pdf-extractor.ts      # pdfjs-dist 텍스트 추출
│   │   │   ├── line-parser.ts        # 배관 라인 Regex
│   │   │   ├── equipment-parser.ts   # 장비 태그 Regex
│   │   │   ├── package-parser.ts     # Test Package Regex
│   │   │   ├── metadata-parser.ts    # 도면 메타데이터
│   │   │   ├── instrument-parser.ts  # 계장 태그
│   │   │   └── golden-joint-parser.ts
│   │   ├── report/
│   │   │   └── excel-generator.ts    # exceljs 엑셀 생성
│   │   └── utils.ts                  # 공통 유틸리티
│   ├── hooks/                        # React 커스텀 훅
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── database.ts               # Supabase 생성 타입
│   │   └── index.ts
│   └── middleware.ts                 # Next.js 미들웨어 (인증 체크)
├── supabase/
│   ├── migrations/                   # SQL 마이그레이션 파일
│   │   └── 00001_initial_schema.sql
│   ├── seed.sql                      # 초기 데이터
│   └── config.toml                   # Supabase CLI 설정
├── public/
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                        # Supabase URL, Anon Key, Service Role Key
├── vercel.json                       # Vercel 설정 (함수 타임아웃 등)
├── PRD.md
├── Task.md
└── idea.md
```

---

## 9. 릴리스 계획

### 9.1 MVP (Phase 1) - 8주

| 주차 | 마일스톤 | 산출물 |
|------|---------|--------|
| W1-2 | Supabase + Vercel 셋업, DB 스키마, 인증, 프로젝트 CRUD | 로그인, 프로젝트 CRUD 동작 |
| W3-4 | PDF 파싱 엔진 (pdfjs-dist + Regex) | Line/Equipment/Package 추출 동작 |
| W5-6 | 프론트엔드 핵심 화면 | 대시보드, Line List, Package 화면 |
| W7 | P&ID 뷰어 + 보고서 (exceljs) | 뷰어 동작, 엑셀 출력 동작 |
| W8 | 통합 테스트 + Vercel Production 배포 | 실제 P&ID 데이터로 E2E 검증 |

### 9.2 Phase 2 - 12주 (MVP 이후)
- 공정 관리 모듈 (Gantt, S-Curve)
- MTO 자동 생성
- AI OCR (이미지 전용 PDF)
- 모바일 반응형
- 고급 Revision 비교

### 9.3 Phase 3 - 12주 (Phase 2 이후)
- AI 챗봇 어시스턴트
- 디지털 트윈 연동
- ERP/SAP API 연동
- 다국어 지원
- 온프레미스 배포 옵션

---

## 10. 리스크 및 제약사항

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|-------|------|----------|
| 텍스트 추출 불가 PDF 비율이 높음 | 높음 | 중간 | Track B(AI OCR) 병행 개발 우선순위 상향 |
| 라인번호 패턴이 프로젝트마다 다름 | 높음 | 높음 | 패턴 설정 UI 제공, 사용자가 Regex 커스텀 가능 |
| 대용량 PDF 처리 시 Vercel 함수 제한 | 중간 | 중간 | Vercel Pro (300초/3GB), 페이지 청크 처리, Supabase Edge Function 대안 |
| 보안 민감 도면의 클라우드 저장 거부 | 높음 | 높음 | Supabase 암호화 + Phase 3 셀프호스팅 Supabase 옵션 |
| 엑셀 양식이 회사마다 다름 | 중간 | 높음 | 기본 템플릿 제공 + 커스텀 템플릿 기능 |

---

## 부록 A: 용어집

| 용어 | 정의 |
|------|------|
| P&ID | Piping and Instrumentation Diagram - 배관계장도 |
| Line List | 프로젝트 내 모든 배관 라인의 상세 목록 |
| Test Package | 수압/공압 시험 단위 묶음 |
| Golden Joint | 시스템 연결을 위한 최종 용접점 |
| MTO | Material Take-Off - 자재 물량 산출 |
| Red-Line | 시공 중 변경사항을 도면에 빨간색으로 표기 |
| IFC | Issued For Construction - 시공용 발행 |
| AFC | Approved For Construction - 시공 승인 |
| Spec Class | 배관 등급 (재질, 압력, 온도에 따른 분류) |
| NDE | Non-Destructive Examination - 비파괴 검사 |
| PWHT | Post Weld Heat Treatment - 용접 후 열처리 |

## 부록 B: 참조 데이터 (대아 P&ID Full 분석 결과)

| 항목 | 수량 |
|------|------|
| 총 페이지 | 417 |
| 도면 번호 | 277개 |
| 장비 태그 | 9,159개 |
| 배관 라인 | 7,158개 |
| 계장 태그 | 491개 |
| Test Package | 1,471개 |
| Golden Joint 페이지 | 17개 |
| 배관 사이즈 종류 | 27종 (1"~56") |
| 유닛 수 | 6개 (2000, 2100, 2200, 2500, 2600, 4400) |
