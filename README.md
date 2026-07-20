# 라방바 데이터랩 · 방송 랭킹 (채용 과제)

[라방바 데이터랩](http://live.ecomm-data.com/assignment)의 방송 리스트를 보여주는 웹 페이지입니다.
유형 토글(**라이브 방송 / 홈쇼핑**)로 목록을 전환하며, 각 유형별 상위 10개 방송을 테이블로 보여줍니다.

## 실행 방법

> 패키지 매니저는 **pnpm**을 사용합니다. ([설치](https://pnpm.io/installation): `npm i -g pnpm`)

```bash
pnpm install
pnpm dev
```

이후 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 기술 스택

- **Next.js 16** (App Router) + React 19 + TypeScript
- 별도 DB/외부 API 없음 — 원본 페이지에서 실시간으로 데이터를 가져옵니다.

## 데이터를 가져오는 방법

<!-- TODO: 아키텍처 상세 (프록시 + __NEXT_DATA__ 파싱) 는 이후 커밋에서 문서화 -->

## 프로젝트 구조

<!-- TODO -->
