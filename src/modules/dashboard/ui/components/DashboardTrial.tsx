import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MAX_FREE_AGENTS,
  MAX_FREE_MEETINGS,
} from "@/modules/premium/constants";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export const DashboardTrial = () => {
  const TRPC = useTRPC();
  const { data } = useQuery(TRPC.premium.getFreeUsage.queryOptions());

  if (!data) return null;

  const agentsPercent =
    (data.agentsCount / MAX_FREE_AGENTS) * 100;

  const meetingsPercent =
    (data.meetingsCount / MAX_FREE_MEETINGS) * 100;

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-sidebar-foreground">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-white">Free trial</p>
        <span className="rounded-full bg-highlight-soft px-2.5 py-0.5 text-[11px] font-medium text-highlight">
          Free plan
        </span>
      </div>

      {/* Agents */}
      <div className="mb-3">
        <p className="mb-1.5 flex justify-between text-xs text-sidebar-foreground/60">
          <span>Agents</span>
          <span>
            {data.agentsCount}/{MAX_FREE_AGENTS}
          </span>
        </p>
        <Progress
          value={agentsPercent}
          className="h-1.5 bg-white/10 [&>div]:bg-brand"
        />
      </div>

      {/* Meetings */}
      <div className="mb-4">
        <p className="mb-1.5 flex justify-between text-xs text-sidebar-foreground/60">
          <span>Meetings</span>
          <span>
            {data.meetingsCount}/{MAX_FREE_MEETINGS}
          </span>
        </p>
        <Progress
          value={meetingsPercent}
          className="h-1.5 bg-white/10 [&>div]:bg-brand"
        />
      </div>

      {/* Upgrade Button */}
      <Button asChild size="sm" className="w-full">
        <Link href="/upgrade">
          Upgrade
        </Link>
      </Button>
    </div>
  );
};
