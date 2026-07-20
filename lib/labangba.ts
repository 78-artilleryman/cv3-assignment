import { formatBroadcastTime } from "./datetime";
import type {
  AssignmentPageProps,
  Broadcast,
  BroadcastType,
  RawHsItem,
  RawLbItem,
} from "./types";

const ASSIGNMENT_URL = "https://live.ecomm-data.com/assignment";

// 원본이 브라우저 요청을 가정하므로 UA를 붙여 안전하게 요청한다.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/** 유형별 방송 목록(상위 10개)을 가져와 정규화해서 반환한다. */
export async function fetchBroadcasts(
  type: BroadcastType,
): Promise<{ items: Broadcast[]; masked: boolean }> {
  // cache: "no-store" → 매 요청마다 원본을 새로 가져와 값이 항상 원본 테이블과 일치하도록 한다.
  const res = await fetch(`${ASSIGNMENT_URL}?type=${type}`, {
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`원본 페이지 요청 실패 (HTTP ${res.status})`);
  }

  const html = await res.text();
  const props = extractPageProps(html);
  const masked = Boolean(props.mask);

  // 과제 요건: 유형별 최대 10개
  const list = props.list.slice(0, 10);
  const items = list.map((raw) =>
    type === "lb"
      ? normalizeLb(raw as RawLbItem, masked)
      : normalizeHs(raw as RawHsItem, masked),
  );

  return { items, masked };
}

/**
 * HTML 안의 <script id="__NEXT_DATA__"> JSON에서 pageProps를 추출한다.
 * Next.js가 SSR 시 페이지 데이터를 이 스크립트 태그에 직렬화해 심어둔다.
 */
export function extractPageProps(html: string): AssignmentPageProps {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) {
    throw new Error("__NEXT_DATA__ 스크립트를 찾을 수 없습니다");
  }
  const data = JSON.parse(match[1]);
  return data.props.pageProps as AssignmentPageProps;
}

/** 라이브 방송(lb) 원본 → 공통 형태 */
function normalizeLb(raw: RawLbItem, masked: boolean): Broadcast {
  return {
    id: raw.objectID,
    title: raw.title,
    platform: "네이버쇼핑LIVE",
    categoryCode: raw.cid,
    category: "", // lb 분류명은 별도 매핑이 필요 → 이후 단계에서 채운다
    startTime: formatBroadcastTime(raw.datetime_start),
    views: raw.visit_cnt,
    salesCount: raw.sales_cnt,
    salesAmount: raw.sales_amt,
    productCount: raw.product_cnt,
    masked,
  };
}

/** 홈쇼핑(hs) 원본 → 공통 형태 (분류명이 응답에 이미 포함되어 있다) */
function normalizeHs(raw: RawHsItem, masked: boolean): Broadcast {
  return {
    id: raw.hsshow_id,
    title: raw.hsshow_title,
    platform: raw.platform_name,
    categoryCode: raw.cat?.cid ?? raw.cid,
    category: raw.cat?.cat_name ?? "",
    startTime: formatBroadcastTime(raw.hsshow_datetime_start),
    views: raw.visit_cnt,
    salesCount: raw.sales_cnt,
    salesAmount: raw.sales_amt,
    productCount: raw.item_cnt,
    masked,
  };
}
