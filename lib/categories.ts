// 분류 코드(cid) → 이름 매핑.
// 라이브 방송(lb) 목록에는 cid(숫자)만 있고 분류명이 없다. 원본 사이트도 이 이름을
// 카테고리 사전(/api/home/gnb 응답의 cats)에서 받아 채우므로, 우리도 같은 사전을 사용한다.
// 사전은 자주 바뀌지 않으므로 한 번 받아오면 모듈 캐시에 담아 재사용한다.

// https로 요청한다. http는 301(→https)로 리다이렉트되며 POST가 GET으로 바뀌어 404가 난다.
const GNB_URL = "https://live.ecomm-data.com/api/home/gnb";

interface CategoryEntry {
  pid: number | null;
  name: string;
}
type CategoryMap = Record<string, CategoryEntry>;

let cache: CategoryMap | null = null;
let inflight: Promise<CategoryMap> | null = null;

async function loadCategories(): Promise<CategoryMap> {
  const res = await fetch(GNB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`카테고리 사전 요청 실패 (HTTP ${res.status})`);
  }
  const data = await res.json();
  return (data.cats ?? {}) as CategoryMap;
}

/** 카테고리 사전을 가져온다. 캐시가 있으면 재사용, 동시 요청은 하나로 합친다. */
export async function getCategoryMap(): Promise<CategoryMap> {
  if (cache) return cache;
  if (!inflight) {
    inflight = loadCategories()
      .then((map) => {
        cache = map;
        return map;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * cid를 분류명으로 변환한다.
 * 원본 테이블은 소분류(예: "노트북")가 아니라 최상위 대분류(예: "디지털/가전")를 표시하므로,
 * pid(부모)를 따라 루트(pid=null)까지 올라간 뒤 그 이름을 쓴다. 사전에 없으면 빈 문자열.
 */
export function resolveCategoryName(
  map: CategoryMap,
  cid: number | null,
): string {
  if (cid == null) return "";
  let entry = map[String(cid)];
  if (!entry) return "";
  while (entry.pid != null && map[String(entry.pid)]) {
    entry = map[String(entry.pid)];
  }
  return entry.name;
}
