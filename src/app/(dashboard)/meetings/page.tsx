import { Suspense } from "react";
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from "../../../modules/meetings/ui/views/meetings-views";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loadSearchParams } from "@/modules/meetings/params";
import { SearchParams } from "nuqs";

interface MeetingPageProps {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: MeetingPageProps) => {

  const filters = await loadSearchParams(searchParams);

  const session = await auth.api.getSession({
        headers: await headers(),
      });
    
      if (!session) {
        redirect('/sign-in');
      }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters
    })
  );

  return (
    <>
    <MeetingsListHeader/>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewError />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
