"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";

export const AgentsView = () => {
  const [filters, setFilter] = useAgentsFilters();
  const trpc = useTRPC();
  const router = useRouter();

  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      search: filters.search,
      page: filters.page,
    })
  );

  return (
    <div className="flex-1 w-full px-4 md:px-8 py-4">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="overflow-x-auto">
          <DataTable
            data={data.items}
            columns={columns}
            onRowClick={(row) =>
              router.push(`/agents/${row.id}`)
            }
          />
        </div>

        {data.items.length === 0 && (
          <EmptyState
            title="No Agents"
            description="You have not created any agents yet."
          />
        )}

        <div className="flex justify-center sm:justify-end">
          <DataPagination
            totalPages={data.totalPages}
            page={filters.page}
            onPageChange={(page) =>
              setFilter({ page })
            }
          />
        </div>
      </div>
    </div>
  );
};

export const AgentsViewLoading = () => (
  <LoadingState
    title="Loading Agents"
    description="Please wait while we load your agents."
  />
);

export const AgentsViewError = () => (
  <ErrorState
    title="Something went wrong"
    description="Please try again later."
  />
);