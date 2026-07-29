# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**고구마마켓**은 동네 기반 중고거래 플랫폼입니다. 당근마켓을 레퍼런스로 하되, 동네 소모임/단톡방 기능까지 포함한 지역 커뮤니티형 서비스를 지향합니다.

- **목적**: 학습 및 포트폴리오 제작 (실 서비스 운영은 목표가 아님 — 코드 품질/구조를 실무 수준으로 유지하되, 과도한 확장성·운영 인프라는 지양)
- **현재 상태**: Next.js 스캐폴딩, Supabase 연결, DB 스키마/RLS, 로그인/회원가입, 홈/상품목록/상품상세, 상품 등록(이미지 업로드 포함) 구현 완료. Vercel 프로덕션 배포 완료. 아직 없는 것: 1:1 채팅, 찜하기 UI, 소모임/단톡방 UI, 신고/차단 UI, GPS 동네 인증(현재는 상품 등록 시 지역을 수동 텍스트 입력).

## 배포

- **프로덕션 URL**: https://goguma-market-peach.vercel.app
- Vercel 프로젝트 `team-5539/goguma-market`, GitHub 저장소(`hj87kang-maker/goguma-market`)와 연결되어 있어 `master` 푸시 시 자동 배포됨.
- 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)는 Vercel 프로젝트의 Production/Preview 환경에 등록되어 있음. 로컬에서 새로 설정할 필요가 있으면 `vercel env add <이름> <환경>` 또는 대시보드에서 처리.
- 수동 배포/재배포: `vercel --prod`

### ⚠️ 배포 정책 (git push ≠ 배포 승인)

- 사용자가 "push해줘"라고만 요청하면 `git push`만 수행하고, `vercel --prod` 같은 수동 배포 명령은 실행하지 말 것. 배포는 별도로 명시적인 요청("배포해줘")이 있을 때만 진행한다.
- **주의**: 이 저장소는 Vercel Git 연동이 되어 있어 `master`에 push하는 순간 Vercel이 자동으로 재배포를 트리거한다. 따라서 "push만 하고 배포는 하지 말아달라"는 요청을 받으면, push는 진행하되 자동 배포가 트리거된다는 사실을 반드시 먼저 안내하고 사용자의 확인을 받을 것 (필요하면 브랜치를 나누거나 Vercel 대시보드에서 Git 연동의 auto-deploy를 끄는 방법도 고려 가능하다고 제안).

## 구현된 화면/라우트

- `/` — 상품 목록(카테고리 필터, 그리드), 우측 하단 상품 등록 FAB
- `/products/[id]` — 상품 상세 (이미지 갤러리, 판매자 정보)
- `/products/new` — 상품 등록 (로그인 필요, 사진 최대 5장 업로드)
- `/login`, `/signup`, `/signup/check-email` — 인증
- 헤더(`src/components/site-header.tsx`)는 모든 페이지 레이아웃에 공통 렌더링되며 로그인 상태에 따라 닉네임/로그아웃 또는 로그인 버튼을 보여줌

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
- 스키마 변경 시 `mcp__supabase__apply_migration`으로 마이그레이션을 남길 것 (직접 SQL 실행보다 마이그레이션 우선). 더미데이터 삽입 등 데이터 조작(DML)은 `mcp__supabase__execute_sql` 사용.
- **Storage 버킷**: `product-images` (public). 업로드 경로는 `{user_id}/{product_id}/{index}.{ext}` 규칙 — RLS 정책(`storage.objects`)이 첫 폴더 세그먼트(`storage.foldername(name)[1]`)를 `auth.uid()`와 비교해 본인 것만 쓰기 허용. public 버킷이라 다운로드는 정책 없이도 가능하므로 광범위한 SELECT 정책은 만들지 말 것(목록 나열 노출 위험, 보안 어드바이저 경고 대상).

### 개발 중 겪은 이슈 (재발 방지용 메모)

- **Server Action이 엉뚱한 함수를 실행하는 문제**: 오래 켜둔 `next dev` 프로세스에서 여러 파일을 반복 수정(HMR)하다 보면 클라이언트가 들고 있는 Server Action 참조가 서버의 다른 액션과 꼬여서(예: 상품 등록 폼 제출이 `signOutAction`을 실행) 엉뚱하게 동작하는 현상을 겪었다. 이상하게 동작하면 먼저 dev 서버를 완전히 재시작해서 재현되는지 확인할 것.
- **페이지 안에 `<button type="submit">`이 여러 개일 때 주의**: 헤더의 로그아웃 폼과 본문 폼이 같은 페이지에 공존하므로, E2E 테스트나 자동화에서 버튼을 선택할 때 `button[type="submit"]`처럼 모호한 셀렉터를 쓰면 헤더 쪽이 먼저 매칭될 수 있다. 텍스트 기반으로 특정할 것.
- **Supabase 기본 이메일 발송(Confirm email 켜짐)은 시간당 발송 한도가 매우 낮음**: 로컬 개발 중 회원가입을 반복 테스트하면 바로 `429 over_email_send_rate_limit`에 걸린다. 개발 중에는 대시보드(Authentication → Email)에서 "Confirm email"을 꺼서 가입 즉시 세션이 생성되게 하는 것을 권장 (MCP 도구로는 이 설정을 변경할 수 없음 — 대시보드에서 직접 처리).

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

## 데이터 모델 (구현 완료)

Supabase Postgres에 마이그레이션으로 적용 완료 (`mcp__supabase__list_migrations`로 이력 확인 가능). 모든 테이블에 RLS 활성화, 보안 어드바이저 경고 0건.

- `profiles` — `auth.users`와 1:1 (id 공유). 닉네임, 동네 인증 정보(`neighborhood_name`/`lat`/`lng`). 회원가입 시 트리거(`handle_new_user`)로 자동 생성.
- `categories` — 상품 카테고리 lookup (디지털기기/가구·인테리어/의류 등 11종 시드 데이터 포함).
- `products` / `product_images` — 상품과 사진(정렬 순서 포함). `status`는 `selling`/`reserved`/`sold` enum.
- `favorites` — `(user_id, product_id)` 복합 PK로 찜 관계 표현.
- `chat_rooms` / `messages` — 상품 기준 1:1 채팅. `chat_rooms`는 `(product_id, buyer_id)` unique. `messages`는 Realtime 발행(publication) 등록됨.
- `groups` / `group_members` / `group_messages` — 동네 소모임. 개설 시 트리거(`handle_new_group`)로 개설자가 `owner`/`approved` 멤버로 자동 등록. 가입은 `pending`으로 신청 후 owner가 승인/거절(`group_members` update). `group_messages`도 Realtime 등록됨.
- `reports` — 신고 대상(`product`/`profile`/`group`/`message`/`group_message`) + 사유 + 처리 상태.
- `blocks` — `(blocker_id, blocked_id)` 복합 PK로 사용자 차단.

### RLS 정책 원칙

- 조회(select)는 기본적으로 공개(상품/카테고리/프로필/소모임)이거나 당사자 한정(찜/채팅/신고/차단/소모임멤버)으로 나뉨.
- 쓰기(insert/update/delete)는 항상 `auth.uid()`가 본인 소유 행일 때만 허용.
- `handle_new_user`/`handle_new_group`은 트리거 전용이며 `anon`/`authenticated`의 직접 RPC 호출 권한은 회수됨(`harden_trigger_functions` 마이그레이션).
- 새 테이블 추가 시 반드시 RLS를 켜고, 변경 후 `mcp__supabase__get_advisors`(security)로 점검할 것.

### 타입 연동

- `src/lib/supabase/types.ts` — `mcp__supabase__generate_typescript_types`로 생성한 `Database` 타입. 스키마 변경 시 재생성해서 덮어쓸 것.
- `client.ts`/`server.ts` 모두 `createBrowserClient<Database>`/`createServerClient<Database>`로 타입 연결됨.

## 디자인 가이드

- **브랜드명**: 고구마마켓 (확정)
- **메인 컬러**: 고구마 보라/자주빛 계열. `src/app/globals.css`의 `@theme` 블록에 `--color-brand-50` ~ `--color-brand-900`로 정의됨 (기본 액션 컬러는 `brand-600` `#8b3d82`). Tailwind에서 `bg-brand-600`처럼 바로 사용 가능.
- **톤앤매너**: 당근마켓처럼 친근하고 따뜻한 동네 커뮤니티 감성. 딱딱한 커머스 느낌보다는 이웃 간 신뢰와 편안함을 강조.
- 채팅/소모임 등 커뮤니티 상호작용이 핵심 UX이므로, 상품 목록/검색뿐 아니라 대화·모임 흐름의 사용성을 우선적으로 고려.
