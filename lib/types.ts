// 방송 유형: lb=라이브 방송, hs=홈쇼핑
export type BroadcastType = "lb" | "hs";

/**
 * 테이블 한 행에 해당하는 "정규화된" 방송 데이터.
 * lb / hs 원본 스키마가 서로 다르기 때문에, 이 공통 형태로 변환해서 UI에 넘긴다.
 */
export interface Broadcast {
  id: string;
  title: string; // 방송정보(제목)
  platform: string; // 플랫폼 (네이버쇼핑LIVE / 롯데홈쇼핑 ...)
  categoryCode: number | null; // 분류 코드(cid)
  category: string; // 분류명 ("" = 아직 이름 미해석)
  startTime: string; // 방송시간 (포맷 완료된 문자열)
  views: number | null; // 조회수/시청률
  salesCount: number | null; // 판매량
  salesAmount: number | null; // 매출액
  productCount: number | null; // 상품수
  masked: boolean; // 잠금 여부 (true면 조회수/판매량/매출액을 🔒 로 표시)
}

/** 과제 페이지 __NEXT_DATA__ 안의 props.pageProps 형태 */
export interface AssignmentPageProps {
  type: BroadcastType;
  mask: boolean;
  list: RawLbItem[] | RawHsItem[];
}

/** 라이브 방송(lb) 원본 항목 */
export interface RawLbItem {
  objectID: string;
  platform_id: string;
  title: string;
  datetime_start: string; // "2607201458" (YYMMDDHHMM)
  product_cnt: number;
  visit_cnt: number | null;
  sales_cnt: number | null;
  sales_amt: number | null;
  cid: number;
}

/** 홈쇼핑(hs) 원본 항목 — lb와 필드명/구조가 완전히 다르다 */
export interface RawHsItem {
  hsshow_id: string;
  platform_id: string;
  platform_name: string;
  hsshow_title: string;
  hsshow_datetime_start: string; // "202607201440" (YYYYMMDDHHMM)
  hsshow_datetime_end: string;
  item_cnt: number;
  cid: number;
  cat?: { cid: number; cat_name: string };
  visit_cnt: number | null;
  sales_cnt: number | null;
  sales_amt: number | null;
}
