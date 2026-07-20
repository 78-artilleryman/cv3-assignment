import Link from "next/link";
import type { BroadcastType } from "@/lib/types";

const TABS: { key: BroadcastType; label: string }[] = [
  { key: "lb", label: "라이브 방송" },
  { key: "hs", label: "홈쇼핑" },
];

export function BroadcastFilter({ active }: { active: BroadcastType }) {
  return (
    <div className="mb-4 flex gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`?type=${tab.key}`}
          className={`cursor-pointer rounded-md border px-3.5 py-1.5 text-sm transition-colors ${
            active === tab.key
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-gray-300 bg-white text-neutral-900 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
