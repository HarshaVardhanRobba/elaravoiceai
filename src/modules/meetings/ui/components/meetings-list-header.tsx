"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { DEFAULT_PAGE } from "@/constants"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { MeetingsSearchFilter } from "./meetings-search-filter"
import { StatusFilter } from "./status-filter"
import { AgentIdFilter } from "./agent-id-filter"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export const MeetingsListHeader = () => {
  const [filters, setFilter] = useMeetingsFilters()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isAnyFilterModified =
    !!filters.search || !!filters.status || !!filters.agentId

  const onClearFilters = () => {
    setFilter({
      search: "",
      page: DEFAULT_PAGE,
      status: null,
      agentId: "",
    })
  }

  return (
    <>
      <NewMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-2 pt-2 md:px-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Meetings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every call, transcript and summary in one place.
            </p>
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Filters Section */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 min-w-max pb-2">

            <MeetingsSearchFilter />
            <StatusFilter />
            <AgentIdFilter />

            {isAnyFilterModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="whitespace-nowrap"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  )
}