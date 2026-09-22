"use client"

import { Button } from "@/components/ui/button"
import { NewAgentDialog } from "./new-agent-dialog"
import { useState } from "react"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { useAgentsFilters } from "../../hooks/use-agents-filters"
import { AgentsSearchFilter } from "./agents-search-filter"
import { DEFAULT_PAGE_SIZE } from "@/constants"
import { ScrollBar } from "@/components/ui/scroll-area"
import { ScrollArea } from "@radix-ui/react-scroll-area"

export const AgentsListHeader = () => {
    const [filters, setFilter] = useAgentsFilters();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isAnyFilterModified = !!filters.search;

    const onClearFilters = () => {
        setFilter({
            search: "",
            page: DEFAULT_PAGE_SIZE,
        });
    }

    return (
        <>
        <NewAgentDialog
            open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-y-5 px-4 pb-2 pt-2 md:px-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                        Agents
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The voice agents that join your meetings.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} variant="default">
                    <PlusIcon />
                    New Agent
                </Button>
            </div>
            <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
                <AgentsSearchFilter />
                {isAnyFilterModified && 
                    (
                        <Button 
                            size="sm" variant="outline" onClick={onClearFilters}
                        >
                            <XCircleIcon />
                            Clear Filters
                        </Button>
                    )
                }
            </div>
            <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        </div>
    </>
    )
}