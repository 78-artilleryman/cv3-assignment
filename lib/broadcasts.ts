import type { Broadcast, BroadcastType } from "./types";

export interface BroadcastsResponse {
  items: Broadcast[];
  masked: boolean;
}

/** 우리 서버(/api/broadcasts)에서 유형별 방송 목록을 가져온다. */
async function getBroadcasts(type: BroadcastType): Promise<BroadcastsResponse> {
  const res = await fetch(`/api/broadcasts?type=${type}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "방송 목록을 불러오지 못했습니다");
  }
  return data;
}

/** useSuspenseQuery 등에 넘길 쿼리 옵션 (키 + 함수를 한곳에서 관리) */
export function broadcastsQuery(type: BroadcastType) {
  return {
    queryKey: ["broadcasts", type] as const,
    queryFn: () => getBroadcasts(type),
  };
}
