"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/components/data-pagination";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();

  const [filters, setFilter] = useMeetingsFilters();

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  const isEmpty = data.items.length === 0;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">

        {isEmpty ? (
          <div className="flex items-center justify-center py-16">
            <EmptyState
              title="Create your first meeting"
              description="You have not created any meetings yet."
            />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Table Container */}
            <div>
              <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row) =>
                  router.push(`/meetings/${row.id}`)
                }
              />
            </div>

            {/* Pagination */}
            <div className="flex justify-end">
              <DataPagination
                totalPages={data.totalPages}
                page={filters.page}
                onPageChange={(page) =>
                  setFilter({ page })
                }
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meetings"
      description="Please wait while we load your meetings."
    />
  );
};

export const MeetingsViewError = () => {
  return (
    <ErrorState
      title="Something went wrong"
      description="Please try again later."
    />
  );
};