"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { broadcastsQuery } from "@/lib/broadcasts";
import type { BroadcastType } from "@/lib/types";

const HEADERS = [
  "#",
  "방송정보",
  "분류",
  "방송시간",
  "조회수",
  "판매량",
  "매출액",
  "상품수",
];

export function BroadcastTable({ type }: { type: BroadcastType }) {
  const { data } = useSuspenseQuery(broadcastsQuery(type));
  const items = data.items;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-neutral-800 text-left text-gray-600">
          {HEADERS.map((h) => (
            <th key={h} className="px-2 py-2 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((b, i) => (
          <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-2 py-2 align-top text-gray-500">{i + 1}</td>
            <td className="px-2 py-2 align-top">
              <span>{b.title}</span>
              <span className="block text-xs text-gray-400">{b.platform}</span>
            </td>
            <td className="px-2 py-2 align-top">{b.category || "-"}</td>
            <td className="px-2 py-2 align-top whitespace-nowrap">
              {b.startTime}
            </td>
            <td className="px-2 py-2 align-top">
              {b.masked ? "🔒" : (b.views ?? "-")}
            </td>
            <td className="px-2 py-2 align-top">
              {b.masked ? "🔒" : (b.salesCount ?? "-")}
            </td>
            <td className="px-2 py-2 align-top">
              {b.masked ? "🔒" : (b.salesAmount ?? "-")}
            </td>
            <td className="px-2 py-2 align-top">{b.productCount ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
