# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**고구마마켓**은 동네 기반 중고거래 플랫폼입니다. 당근마켓을 레퍼런스로 하되, 동네 소모임/단톡방 기능까지 포함한 지역 커뮤니티형 서비스를 지향합니다.

- **목적**: 학습 및 포트폴리오 제작 (실 서비스 운영은 목표가 아님 — 코드 품질/구조를 실무 수준으로 유지하되, 과도한 확장성·운영 인프라는 지양)
- **현재 상태**: Next.js 스캐폴딩, Supabase 연결, DB 스키마/RLS, 로그인/회원가입, 홈/상품목록/상품상세, 상품 등록(이미지 업로드 포함), 프로필 페이지(판매중/판매완료/구매내역/소모임 탭), 하단 탭바 내비게이션, TossPayments 결제(구매하기 → 결제 → 판매완료 처리), 1:1 채팅(Realtime) 구현 완료. Vercel 프로덕션 배포 완료. 아직 없는 것: 찜하기 UI, 소모임 개설/가입/단톡방 UI, 신고/차단 UI, GPS 동네 인증(현재는 상품 등록 시 지역을 수동 텍스트 입력).

### 제품 방향: 인스타그램 스타일 프로필 중심 UX

당근마켓의 피드형 UX에서, **프로필 페이지를 중심으로 한 인스타그램 스타일**로 방향을 구체화함:

- 회원가입 시 자동으로 자신의 프로필 페이지(`/profile/[id]`)가 생기고, 거기서 자유롭게 상품을 판매·조회.
- 다른 사람의 프로필에 들어가서 게시물(상품)별로 **DM(채팅)을 걸어 거래**하는 방식 — 채팅은 상품 단위(`chat_rooms.product_id`)로 개설됨.
- 소모임은 개설 즉시 자동으로 단톡방이 열림(이미 스키마 트리거로 구현됨: `handle_new_group`이 개설자를 owner/approved 멤버로 등록).
- 내비게이션은 하단 탭바(홈/채팅/프로필) 구조 — 상단 헤더는 로고만 남기고, 로그인/로그아웃은 프로필 페이지로 이동.

## 배포

- **프로덕션 URL**: https://goguma-market-peach.vercel.app
- Vercel 프로젝트 `team-5539/goguma-market`, GitHub 저장소(`hj87kang-maker/goguma-market`)와 연결되어 있어 `master` 푸시 시 자동 배포됨.
- 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)는 Vercel 프로젝트의 Production/Preview 환경에 등록되어 있음. 로컬에서 새로 설정할 필요가 있으면 `vercel env add <이름> <환경>` 또는 대시보드에서 처리.
- 수동 배포/재배포: `vercel --prod`
- **push하면 자동 재배포된다.** 이 저장소는 Vercel Git 연동이 되어 있어 `master`에 push하는 순간 Vercel이 알아서 재배포한다. push 요청을 받으면 별도 확인 없이 그냥 push하면 되고, 그것만으로 배포까지 끝난다 (수동 `vercel --prod`를 따로 실행할 필요는 없음).

## 구현된 화면/라우트

- `/` — 상품 목록(카테고리 필터, 그리드), 우측 하단 상품 등록 FAB
- `/products/[id]` — 상품 상세 (이미지 갤러리, 판매자 프로필 링크)
- `/products/new` — 상품 등록 (로그인 필요, 사진 최대 5장 업로드)
- `/profile` — 로그인한 본인의 `/profile/[id]`로 리다이렉트 (비로그인 시 `/login`)
- `/profile/[id]` — 프로필 페이지. 탭: 판매중 / 판매완료 / 구매내역 / 소모임. 본인 프로필일 때만 로그아웃 버튼 노출
- `/chat` — 내 채팅방 목록 (로그인 필요)
- `/chat/[roomId]` — 1:1 채팅방. Supabase Realtime(`postgres_changes`)으로 새 메시지 즉시 반영. 구매자에게는 대화 중에도 "구매하기" 버튼 노출
- `/checkout/[paymentId]` — TossPayments 결제 화면. 상품 상세의 "구매하기" 버튼(`createPaymentAction`)이 `payments` pending 행을 만들고 여기로 리다이렉트함
- `/payments/success`, `/payments/fail` — Route Handler(페이지 아님). Toss가 결제 후 리다이렉트하는 콜백 URL. 서버에서 승인(confirm) API를 호출하고 `/payments/[id]`로 다시 리다이렉트
- `/payments/[id]` — 결제 결과 표시 페이지 (성공/실패/처리중)
- `/login`, `/signup`, `/signup/check-email` — 인증
- `src/components/site-header.tsx` — 상단 헤더, 로고만 표시 (로그인/로그아웃은 프로필 페이지로 이동함)
- `src/components/bottom-nav.tsx` — 하단 탭바(홈/채팅/프로필), 모든 페이지에 공통 렌더링. `usePathname`으로 활성 탭 표시

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

## 채팅 (Supabase Realtime)

- 흐름: 상품 상세 "채팅하기"(`startChatAction`) → 이미 방이 있으면 재사용, 없으면 `chat_rooms` 생성 → `/chat/[roomId]`로 이동. 메시지 전송은 `sendMessageAction`(Server Action, 단순 insert)이고, 실시간 수신은 클라이언트 컴포넌트(`src/components/chat-messages.tsx`)가 `postgres_changes` 구독으로 처리.
- ⚠️ **Realtime 구독 전에 반드시 `supabase.realtime.setAuth(session.access_token)`을 명시적으로 호출할 것.** 자세한 내용은 아래 "개발 중 겪은 이슈"의 Realtime 항목 참고 — 이걸 빼먹으면 구독 자체는 성공(`status: "ok"`)하지만 이벤트가 하나도 안 오는, 조용히 깨지는 형태의 버그가 난다.

## 결제 (TossPayments)

- v2 SDK, **결제위젯(widgets) 방식이 아니라 "개별 연동"(`tossPayments.payment({ customerKey })` → `payment.requestPayment({ method: "CARD", ... })`) 방식**을 사용한다. 이유: 이 프로젝트에 등록된 클라이언트 키가 "개별 연동 키"라서 위젯 방식(`.widgets()`)으로 초기화하면 `API 개별 연동 키는 지원하지 않습니다` 에러가 남. 새 Toss 키를 발급받아 위젯 방식으로 바꾸고 싶다면 Toss 대시보드에서 "결제위젯 연동 키"를 새로 받아야 함.
- 흐름: 상품 상세 "구매하기" → `createPaymentAction`이 `payments` 행(status=`pending`)을 생성 → `/checkout/[id]`에서 SDK로 결제창 오픈 → 성공 시 Toss가 `/payments/success?paymentKey&orderId&amount`로 리다이렉트 → 서버가 저장된 금액으로 승인(confirm) API 호출 → 성공하면 `confirm_payment_success` RPC(SECURITY DEFINER)로 `payments`와 `products`(상태 `sold`, `buyer_id`)를 함께 갱신 → `/payments/[id]`에서 결과 표시. 실패/취소는 `/payments/fail`이 처리.
- **`orderId`로 `payments.id`(uuid)를 그대로 사용**한다 — 별도 주문번호 컬럼 없음.
- **금액 검증은 반드시 서버에 저장된 `payments.amount` 기준**으로 한다 (successUrl 쿼리의 `amount` 값을 그대로 믿지 않음) — Toss 공식 가이드의 핵심 보안 규칙.
- 환경변수: `NEXT_PUBLIC_TOSS_CLIENT_KEY`(브라우저 노출 가능), `TOSS_SECRET_KEY`(서버 전용, confirm API Basic Auth에 사용), `TOSS_WEBHOOK_SECRET`(현재 웹훅은 미구현이라 사용 안 함, 값만 보관 중).
- 새 문서가 필요하면 `https://docs.tosspayments.com/...` URL 끝에 `.md`를 붙여서 WebFetch하면 실제 마크다운 원본을 받을 수 있음 (HTML 페이지를 그냥 fetch하면 SPA 셸만 나오고 실제 콘텐츠가 안 보임).

### 개발 중 겪은 이슈 (재발 방지용 메모)

- **Server Action이 엉뚱한 함수를 실행하는 문제**: 오래 켜둔 `next dev` 프로세스에서 여러 파일을 반복 수정(HMR)하다 보면 클라이언트가 들고 있는 Server Action 참조가 서버의 다른 액션과 꼬여서(예: 상품 등록 폼 제출이 `signOutAction`을 실행) 엉뚱하게 동작하는 현상을 겪었다. 이상하게 동작하면 먼저 dev 서버를 완전히 재시작해서 재현되는지 확인할 것.
- **페이지 안에 `<button type="submit">`이 여러 개일 때 주의**: 헤더의 로그아웃 폼과 본문 폼이 같은 페이지에 공존하므로, E2E 테스트나 자동화에서 버튼을 선택할 때 `button[type="submit"]`처럼 모호한 셀렉터를 쓰면 헤더 쪽이 먼저 매칭될 수 있다. 텍스트 기반으로 특정할 것.
- **Supabase 기본 이메일 발송(Confirm email 켜짐)은 시간당 발송 한도가 매우 낮음**: 로컬 개발 중 회원가입을 반복 테스트하면 바로 `429 over_email_send_rate_limit`에 걸린다. 개발 중에는 대시보드(Authentication → Email)에서 "Confirm email"을 꺼서 가입 즉시 세션이 생성되게 하는 것을 권장 (MCP 도구로는 이 설정을 변경할 수 없음 — 대시보드에서 직접 처리).
- **RLS UPDATE 정책에 `WITH CHECK` 없이 `USING`만 쓰면, 상태 전이 자체가 막힐 수 있음**: `payments`의 `pending → failed` 업데이트가 `USING (status = 'pending')`만 있는 정책 때문에 조용히 0건 처리되는(에러 없이 그냥 안 바뀌는) 버그가 있었다. `WITH CHECK`가 없으면 Postgres가 `USING`을 새 행에도 적용해서, 새 상태가 더 이상 `pending`이 아니면 체크에 걸린다. **행의 상태값 자체를 바꾸는 UPDATE 정책은 항상 `USING`(기존 행 조건)과 `WITH CHECK`(새 행 조건, 보통 소유권만 검사)를 분리해서 작성할 것.**
- **Toss 테스트 결제는 가짜 테스트카드 번호가 따로 없음**: 실제 카드 정보를 입력해야 하며(테스트 환경이라 실제로 돈은 안 빠져나감), 그래서 이 세션에서는 결제 성공 경로(카드 승인 → `confirm_payment_success` 실행)를 실제 카드로 끝까지 클릭해보지 못했다. 대신 승인 API에 가짜 `paymentKey`를 보내 실패 응답을 받는 경로로 라우트 핸들러(승인 호출 → 실패 처리 → 결과 페이지)를 검증했다. **성공 경로를 완전히 확인하려면 실제 카드로 한 번 결제해봐야 한다.** (→ 이후 사용자가 실제 카드로 직접 확인 완료함.)
- **Supabase Realtime(`postgres_changes`) 구독이 "성공"해도 이벤트를 전혀 못 받을 수 있음**: 브라우저 클라이언트가 쿠키에 이미 있던 세션으로 페이지를 로드한 경우(= 이 페이지에서 로그인한 게 아니라 이전 페이지에서부터 로그인 상태였던 경우), Realtime 웹소켓에 인증 토큰이 자동으로 실리지 않아 `auth.uid()`가 익명으로 평가되고, `messages_select_participant`처럼 `auth.uid()`를 참조하는 RLS 정책이 모든 이벤트를 조용히 걸러버린다. 구독 자체는 `phx_reply {"status":"ok"}`로 정상 응답하기 때문에 에러 없이 그냥 아무 일도 안 일어나는 것처럼 보인다. **해결**: 채널을 구독하기 전에 `const { data: { session } } = await supabase.auth.getSession(); if (session) supabase.realtime.setAuth(session.access_token);`를 먼저 호출할 것 (`src/components/chat-messages.tsx` 참고). 실시간 기능이 "가끔 안 온다"가 아니라 "전혀 안 온다"면 이걸 가장 먼저 의심할 것.

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

- 소셜 로그인(카카오/구글 등)
- 매너온도 등 고도화된 신뢰도 지표

> 참고: 애초 MVP 인터뷰에서는 "인앱 결제/안전거래는 초기 제외, 직거래만 지원"으로 정했으나, 이후 사용자 요청으로 TossPayments 결제를 추가했다(위 "결제 (TossPayments)" 섹션 참고). 에스크로(안전거래)까지는 아니고 일반 카드 결제 확인·구매내역 반영 수준이다.

## 데이터 모델 (구현 완료)

Supabase Postgres에 마이그레이션으로 적용 완료 (`mcp__supabase__list_migrations`로 이력 확인 가능). 모든 테이블에 RLS 활성화, 보안 어드바이저 경고 0건.

- `profiles` — `auth.users`와 1:1 (id 공유). 닉네임, 동네 인증 정보(`neighborhood_name`/`lat`/`lng`). 회원가입 시 트리거(`handle_new_user`)로 자동 생성.
- `categories` — 상품 카테고리 lookup (디지털기기/가구·인테리어/의류 등 11종 시드 데이터 포함).
- `products` / `product_images` — 상품과 사진(정렬 순서 포함). `status`는 `selling`/`reserved`/`sold` enum. `buyer_id`(nullable, profiles FK)는 거래 완료 시 구매자를 기록하는 컬럼 — 현재 스키마만 있고 이걸 채우는 UI(채팅방에서 "구매자 지정")는 아직 미구현.
- `favorites` — `(user_id, product_id)` 복합 PK로 찜 관계 표현.
- `chat_rooms` / `messages` — 상품 기준 1:1 채팅. `chat_rooms`는 `(product_id, buyer_id)` unique. `messages`는 Realtime 발행(publication) 등록됨.
- `groups` / `group_members` / `group_messages` — 동네 소모임. 개설 시 트리거(`handle_new_group`)로 개설자가 `owner`/`approved` 멤버로 자동 등록. 가입은 `pending`으로 신청 후 owner가 승인/거절(`group_members` update). `group_messages`도 Realtime 등록됨.
- `reports` — 신고 대상(`product`/`profile`/`group`/`message`/`group_message`) + 사유 + 처리 상태.
- `blocks` — `(blocker_id, blocked_id)` 복합 PK로 사용자 차단.
- `payments` — TossPayments 결제 기록. `status`는 `pending`/`done`/`failed`/`canceled` enum. `id`를 Toss `orderId`로 그대로 사용. `confirm_payment_success(payment_id, toss_payment_key)` RPC(SECURITY DEFINER)가 결제 승인 시 이 테이블과 `products`(상태/구매자)를 함께 갱신함.

### RLS 정책 원칙

- 조회(select)는 기본적으로 공개(상품/카테고리/프로필/소모임)이거나 당사자 한정(찜/채팅/신고/차단)으로 나뉨.
- `group_members`는 예외적으로 혼합: **승인된(`status='approved'`) 멤버십은 공개 조회 가능**(`group_members_select_public_approved` 정책) — 프로필 페이지의 "가입한 소모임" 탭이 다른 사람에게도 보여야 하기 때문. `pending`/`rejected`는 여전히 본인/모임장만 조회 가능.
- 쓰기(insert/update/delete)는 항상 `auth.uid()`가 본인 소유 행일 때만 허용.
- `handle_new_user`/`handle_new_group`은 트리거 전용이며 `anon`/`authenticated`의 직접 RPC 호출 권한은 회수됨(`harden_trigger_functions` 마이그레이션). 반대로 `confirm_payment_success`는 **의도적으로 `authenticated`에게 RPC 실행을 허용**한 SECURITY DEFINER 함수임 — 구매자 세션이 직접 호출해야 하고, 함수 내부에서 `buyer_id = auth.uid()`를 검사하므로 안전함. 보안 어드바이저가 이 함수에 대해 경고를 띄우는 건 정상이며 무시할 것.
- 새 테이블 추가 시 반드시 RLS를 켜고, 변경 후 `mcp__supabase__get_advisors`(security)로 점검할 것.
- **프로필 페이지처럼 "다른 사람이 봐야 하는" 데이터를 새로 노출할 때는, 해당 데이터의 select 정책이 실제로 공개인지 먼저 확인할 것.** 소모임 탭 구현 때 `group_members` select가 본인/모임장 한정이라 다른 사람 프로필에서 빈 목록으로 보이는 버그가 있었음(데이터는 있는데 RLS가 막음). 로컬에서 화면이 비어 보이면 코드 버그보다 RLS를 먼저 의심해볼 것.

### 타입 연동

- `src/lib/supabase/types.ts` — `mcp__supabase__generate_typescript_types`로 생성한 `Database` 타입. 스키마 변경 시 재생성해서 덮어쓸 것.
- `client.ts`/`server.ts` 모두 `createBrowserClient<Database>`/`createServerClient<Database>`로 타입 연결됨.

## 디자인 가이드

- **브랜드명**: 고구마마켓 (확정)
- **메인 컬러**: 고구마 보라/자주빛 계열. `src/app/globals.css`의 `@theme` 블록에 `--color-brand-50` ~ `--color-brand-900`로 정의됨 (기본 액션 컬러는 `brand-600` `#8b3d82`). Tailwind에서 `bg-brand-600`처럼 바로 사용 가능.
- **톤앤매너**: 당근마켓처럼 친근하고 따뜻한 동네 커뮤니티 감성. 딱딱한 커머스 느낌보다는 이웃 간 신뢰와 편안함을 강조.
- 채팅/소모임 등 커뮤니티 상호작용이 핵심 UX이므로, 상품 목록/검색뿐 아니라 대화·모임 흐름의 사용성을 우선적으로 고려.
