# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**고구마마켓**은 동네 기반 중고거래 플랫폼입니다. 당근마켓을 레퍼런스로 하되, 동네 소모임/단톡방 기능까지 포함한 지역 커뮤니티형 서비스를 지향합니다.

- **목적**: 학습 및 포트폴리오 제작 (실 서비스 운영은 목표가 아님 — 코드 품질/구조를 실무 수준으로 유지하되, 과도한 확장성·운영 인프라는 지양)
- **현재 상태**: Next.js 스캐폴딩 완료, Supabase 프로젝트 연결 완료. 화면/스키마는 아직 구현 전.

## 명령어

```bash
npm run dev     # 개발 서버 (Turbopack, http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint
```

단일 테스트 명령은 아직 없음 (테스트 프레임워크 미도입, 필요 시 추가할 것).

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + TypeScript, Tailwind CSS v4
- **백엔드/DB/인증/스토리지**: Supabase (Postgres, Auth, Storage, Realtime)
  - 1:1 채팅, 소모임 단톡방은 Supabase Realtime(또는 Postgres Changes)으로 구현
- **이미지 저장**: Supabase Storage
- **배포**: Vercel
- **인증 방식**: 이메일/비밀번호 (Supabase Auth). 소셜 로그인은 MVP 범위 아님.

### ⚠️ Next.js 16 주의사항

이 프로젝트는 Next.js 16을 사용한다. 학습 데이터 시점 지식과 다른 breaking change가 있으므로, App Router API를 사용하기 전 `node_modules/next/dist/docs/`의 관련 문서를 확인할 것. 특히:

- **`middleware.ts`가 폐지되고 `proxy.ts`로 대체됨** (파일명·export 함수명 모두 `proxy`). 이 프로젝트에는 `src/proxy.ts`가 있으며, `middleware.ts`를 새로 만들지 말 것.
- `cookies()`, `headers()`, `params`, `searchParams` 등은 비동기(Promise) API — 반드시 `await` 필요.

## Supabase 연결

- 프로젝트명: `goguma-market` (ref: `yujngnawyxsavvnjeyxh`, region: `ap-northeast-2` 서울)
- 조직: `hj87kang-maker's Org`
- 환경변수는 `.env.local`에 위치 (`.gitignore` 처리됨, 커밋 금지). `.env.local.example`을 템플릿으로 사용.
- 클라이언트 유틸:
  - `src/lib/supabase/client.ts` — 브라우저(Client Component)용
  - `src/lib/supabase/server.ts` — 서버(Server Component/Route Handler)용
  - `src/lib/supabase/proxy.ts` — `updateSession()`, `src/proxy.ts`에서 세션 갱신에 사용
- DB 스키마/RLS 정책은 아직 미작성. 테이블 생성 시 `mcp__supabase__apply_migration`으로 마이그레이션을 남길 것 (직접 SQL 실행보다 마이그레이션 우선).

## 플랫폼 형태

- 반응형 웹앱 1개로 모바일/데스크톱 모두 대응 (모바일 퍼스트로 설계, 네이티브 앱 전환은 미래 고려사항)

## 핵심 기능 (MVP 범위)

1. **상품 등록/조회/검색** — 사진, 제목, 가격, 카테고리, 상태(설명) 포함. 카테고리는 특정 도메인에 한정하지 않는 범용 중고거래(디지털, 가구, 의류, 유아용품 등 전 카테고리).
2. **1:1 채팅** — 상품 기준으로 구매자-판매자 실시간 대화.
3. **찜하기/관심목록** — 관심 상품 저장 및 목록 조회.
4. **동네 인증** — GPS 기반 자동 동네 인증을 기본으로 하되, 위치 권한 미허용 시 수동 동네 선택 fallback 지원.
5. **동네 소모임** — 인증된 동네 사용자가 누구나 소모임을 개설할 수 있음(당근마켓 '동네생활/모임' 스타일). 가입 신청 및 소모임 전용 단톡방(그룹 채팅) 포함.
6. **신고/차단** — 부적절한 상품/게시글 신고, 사용자 차단 기본 기능.

### MVP 범위 제외 (추후 고려)

- 인앱 결제 / 안전거래(에스크로) — 초기에는 직거래만 지원
- 소셜 로그인(카카오/구글 등)
- 매너온도 등 고도화된 신뢰도 지표

## 데이터 모델 초안

향후 스키마 설계 시 아래 엔터티를 기준으로 시작할 것:

- `users` — 프로필, 인증된 동네 정보
- `products` — 상품(제목/가격/카테고리/이미지/상태/지역/판매자)
- `favorites` — 사용자-상품 찜 관계
- `chat_rooms` / `messages` — 상품 기준 1:1 채팅
- `groups`(소모임) / `group_members` / `group_messages` — 동네 소모임 및 단톡방
- `reports` — 신고 대상(상품/사용자/게시글), 사유, 처리 상태

## 디자인 가이드

- **브랜드명**: 고구마마켓 (확정)
- **메인 컬러**: 고구마(자주감자·보라고구마) 보라/자주빛 계열 — 구체적인 색상 팔레트는 디자인 작업 시 확정
- **톤앤매너**: 당근마켓처럼 친근하고 따뜻한 동네 커뮤니티 감성. 딱딱한 커머스 느낌보다는 이웃 간 신뢰와 편안함을 강조.
- 채팅/소모임 등 커뮤니티 상호작용이 핵심 UX이므로, 상품 목록/검색뿐 아니라 대화·모임 흐름의 사용성을 우선적으로 고려.
