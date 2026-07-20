# CV3 프론트엔드 채용 과제 · 방송 랭킹

[라방바 데이터랩](https://live.ecomm-data.com/assignment)의 방송 리스트를 보여주는 웹 페이지입니다.
유형 토글(**라이브 방송 / 홈쇼핑**)로 목록을 전환하며, 각 유형별 상위 10개 방송을 테이블로 보여줍니다.

## 실행 방법

패키지 매니저는 **pnpm**을 사용합니다. (미설치 시: `npm i -g pnpm`)

```bash
pnpm install
pnpm dev
```

이후 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

- 검증 환경: Node.js 24 / pnpm 10
- 유형은 URL 쿼리로도 열 수 있습니다 → `/?type=lb` (라이브), `/?type=hs` (홈쇼핑)

## 기술 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **TanStack Query v5** — 서버 프리페치 + Suspense 데이터 패칭
- **Tailwind CSS v4**
- 별도 DB/백엔드 없음. 데이터는 원본 페이지에서 **요청 시점에 실시간으로** 가져옵니다.

## 데이터를 가져오는 방법

과제에서 별도 API를 제공하지 않으므로, 원본 페이지에서 직접 데이터를 확보합니다.

### 1) 원본은 `__NEXT_DATA__`에 데이터가 들어있다

원본 과제 페이지는 Next.js로 만들어져 있어, SSR 시 페이지 데이터가 HTML 안
`<script id="__NEXT_DATA__">` 태그에 JSON으로 직렬화되어 내려옵니다. 따라서 별도의 크롤링(헤드리스
브라우저 등) 없이 **HTML을 받아 이 스크립트의 JSON만 파싱**하면 방송 목록을 얻을 수 있습니다.

- 유형 전환은 URL 쿼리로 구분됩니다: `?type=lb`(라이브) / `?type=hs`(홈쇼핑)
- 목록(`pageProps.list`)에서 **상위 10개**만 사용합니다.

### 2) CORS 회피 — 서버(프록시)에서 파싱

브라우저에서 원본 도메인을 직접 호출하면 CORS로 막히므로, **우리 서버(Next.js Route Handler)가
원본을 대신 받아** 파싱·정규화한 뒤 프론트엔드에 전달합니다.

```
브라우저  ──/api/broadcasts?type=lb──▶  Next.js 서버  ──assignment?type=lb──▶  원본
   ▲                                       │  __NEXT_DATA__ 파싱 → 상위 10개
   │                                       │  lb/hs 정규화 · 분류명 해석
   └────────── 정규화된 JSON ───────────────┘
```

### 3) lb와 hs는 응답 스키마가 다르다 → 각각 정규화

라이브(lb)와 홈쇼핑(hs)은 필드명·구조가 서로 달라 각각의 정규화 함수로 공통 형태(`Broadcast`)로 변환합니다.

| 항목 | 라이브 (lb) | 홈쇼핑 (hs) |
| --- | --- | --- |
| 제목 | `title` | `hsshow_title` |
| 방송시간 | `datetime_start` (`YYMMDDHHMM`) | `hsshow_datetime_start` (`YYYYMMDDHHMM`) |
| 상품수 | `product_cnt` | `item_cnt` |
| 분류 | `cid`(코드)만 → 별도 해석 필요 | `cat.cat_name`(응답에 포함) |

### 4) 분류(분류명) 해석

- **hs**: 응답의 `cat.cat_name`에 이미 대분류명이 있어 그대로 사용합니다.
- **lb**: 응답에 분류 코드(`cid`)만 있습니다. 원본 사이트가 사용하는 것과 동일한 카테고리 사전
  (`/api/home/gnb`의 `cats`)을 받아 `cid → 이름`으로 변환합니다. 이 사전은 한 번 받으면 캐시합니다.
- 원본 테이블은 소분류가 아니라 **최상위 대분류**를 표시하므로(예: `노트북` → `디지털/가전`),
  부모(`pid`)를 루트까지 따라 올라가 대분류명을 사용합니다.

### 5) 자물쇠(잠금) 값

조회수/판매량/매출액은 원본에서 로그인 전 잠금 상태(`🔒`)입니다. 과제 안내상 자물쇠 기능 자체는
구현하지 않아도 되므로, 잠금 컬럼은 `🔒`로 표시합니다.

### 6) 렌더링 — 서버 프리페치 + Suspense

페이지(서버 컴포넌트)에서 데이터를 미리 프리페치해 `HydrationBoundary`로 클라이언트에 전달합니다.
따라서 테이블은 **서버에서 데이터까지 렌더(SSR)** 되고, 클라이언트의 `useSuspenseQuery`는
하이드레이션된 캐시를 그대로 읽습니다. 필터 상태는 로컬 state가 아니라 **URL 쿼리(`?type=`)**에
두어 새로고침·링크 공유에도 유지됩니다.

## 프로젝트 구조

```
app/
  page.tsx                     서버 컴포넌트. ?type= 를 읽어 프리페치 + HydrationBoundary
  layout.tsx                   QueryClientProvider 주입
  api/broadcasts/route.ts      프록시: 원본 파싱·정규화 결과를 JSON으로 반환
components/
  BroadcastFilter.tsx          유형 토글(라이브/홈쇼핑) — URL 쿼리로 상태 관리
  BroadcastTable.tsx           방송 테이블 — useSuspenseQuery 로 데이터 표시
  BroadcastErrorBoundary.tsx   요청 실패 처리(+다시 시도)
  Providers.tsx                QueryClient 생성/제공
lib/
  labangba.ts                  원본 fetch + __NEXT_DATA__ 파싱 + lb/hs 정규화
  categories.ts                분류 코드→이름 사전(gnb) 로드/캐시 + 대분류 해석
  datetime.ts                  방송시간 포맷(YYMMDDHHMM / YYYYMMDDHHMM → 표시용)
  broadcasts.ts                클라이언트 쿼리 함수/키
  types.ts                     원본/정규화 타입 정의
```

## 참고

- 라이브 방송 목록은 시간에 따라 바뀌므로, 표시되는 값은 조회 시점의 원본과 동일합니다.
- 원본 요청은 `https`로 보냅니다. `http`는 301 리다이렉트(→`https`) 과정에서 POST가 GET으로
  바뀌어 일부 요청이 실패하기 때문입니다.
