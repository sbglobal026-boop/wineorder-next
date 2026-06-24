@AGENTS.md

# table code (wineorder-next)

프리미엄 와인 쇼핑몰. Next.js + Tailwind + Supabase 기반.

## 기술 스택
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: 인증(Auth), DB(Postgres), 파일 저장(Storage)
- 배포: Vercel (GitHub main 브랜치 push 시 자동 배포)

## 데이터 저장 위치
| 데이터 | 위치 |
|---|---|
| 상품(products) | Supabase `products` 테이블 (`src/lib/products.ts`) |
| 블로그 글/좋아요/댓글 | Supabase `blog_posts`, `blog_likes`, `blog_comments` (`src/lib/blog.ts`) |
| 추천(Top Drop) 상품 ID | Supabase `app_config` 테이블 (key: `featuredProductId`) |
| 회원 인증 | Supabase Auth (`src/context/AuthContext.tsx`) |
| 이미지 파일 | Supabase Storage 버킷 `blog-images`, `product-images` (`src/lib/uploadImage.ts`) — base64로 DB에 저장하지 않음 |
| 배너 슬라이드, 광고문구, 섹션 on/off, 승인된 작성자 목록 | 브라우저 `localStorage` (`src/context/AppConfigContext.tsx`) — 아직 서버 미이전 |

## Admin
- `/admin` — 상품/블로그/작성자/배너/섹션 관리. **로그인 보호 없음** (URL만 알면 접근 가능, 추후 보강 필요)
- 블로그/상품 글쓰기·수정·삭제 시 연결된 Storage 이미지도 함께 정리됨 (`removeStorageFiles`)

## 디자인 톤 ("table code" 브랜드)
- 참고 디자인: WatchHouse(원두 브랜드) 홈페이지 구조를 와인 쇼핑몰로 변형
- 폰트: Schibsted Grotesk (`--font-grotesk`, 영문/숫자에만 적용됨 — 한글은 시스템 폰트로 자동 폴백)
- 색상: 차콜 `#1C1A17`, 크림 `#FBFAF7`, 베이지 `#DAD4CD`
- 레이아웃 폭: 콘텐츠 1600px + 좌우 패딩 20px = **`max-w-[1640px] mx-auto`** 패턴을 모든 섹션(헤더/메인/푸터)에 통일 적용. 배경색도 이 박스 안에서만 칠해짐 (화면 끝까지 안 감)
- 섹션 간 수직 간격: 기본 `mt-24 md:mt-[140px]` (홈페이지 `src/app/(shop)/page.tsx` 참고)

## GitHub / 배포
- `git push`는 GitHub Personal Access Token 필요 (macOS 키체인에 저장해 재사용 중)
- push 전 항상 `npm run dev` 또는 `next build`로 로컬 확인 권장

## 작업 시 주의
- 코드 수정 후 `rm -rf .next && npx next build`로 빌드 에러 확인 후 push할 것
- 토큰/API 키는 `.env.local`에만 두고 절대 채팅/코드에 노출하지 말 것

## 작업 방식 (필수 규칙)
- **push는 사용자가 "push"라고 직접 입력했을 때만 실행한다.** 작업 완료 후에도 먼저 묻고, 자동으로 push하지 않는다.
- **작업을 바로 실행하지 않는다.** 사용자 요청을 받으면 먼저 어떻게 이해했는지 정리해서 보여주고, 확인받은 뒤에 실행한다.
- **항상 로컬(`http://localhost:3000`)에서 먼저 확인한다.** `npm run dev`로 로컬 서버를 띄워 변경사항을 검증한 뒤 다음 단계로 진행한다.
- **주석은 한국어로 작성한다.**
