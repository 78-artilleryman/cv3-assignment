import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { BroadcastErrorBoundary } from "@/components/BroadcastErrorBoundary";
import { BroadcastFilter } from "@/components/BroadcastFilter";
import { BroadcastTable } from "@/components/BroadcastTable";
import { broadcastsQuery } from "@/lib/broadcasts";
import { fetchBroadcasts } from "@/lib/labangba";
import type { BroadcastType } from "@/lib/types";

// 서버 컴포넌트. 필터 상태는 URL(?type=)에서 읽으므로 클라이언트 지시어가 필요 없다.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType: BroadcastType = type === "hs" ? "hs" : "lb";

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: broadcastsQuery(activeType).queryKey,
    queryFn: () => fetchBroadcasts(activeType),
  });

  return (
    <main className="mx-auto my-10 max-w-4xl px-4">
      <h1 className="mb-4 text-xl font-bold">라방 · 홈쇼핑 랭킹 (채용 과제)</h1>

      <BroadcastFilter active={activeType} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <BroadcastErrorBoundary>
          <Suspense
            key={activeType}
            fallback={
              <p className="py-4 text-sm text-gray-500">불러오는 중…</p>
            }
          >
            <BroadcastTable type={activeType} />
          </Suspense>
        </BroadcastErrorBoundary>
      </HydrationBoundary>
    </main>
  );
}
