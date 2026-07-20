import { fetchBroadcasts } from "@/lib/labangba";
import type { BroadcastType } from "@/lib/types";

/**
 * GET /api/broadcasts?type=lb|hs
 * 원본 과제 페이지를 서버에서 대신 가져와(CORS 회피) 파싱·정규화한 결과를 반환한다.
 */
export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");

  if (type !== "lb" && type !== "hs") {
    return Response.json(
      { error: "type 파라미터는 'lb' 또는 'hs' 여야 합니다" },
      { status: 400 },
    );
  }

  try {
    const data = await fetchBroadcasts(type as BroadcastType);
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
