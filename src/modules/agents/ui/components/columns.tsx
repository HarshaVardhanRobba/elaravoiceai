"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgentsGetMany } from "../../types"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { CornerDownRightIcon, CornerRightDownIcon, VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<AgentsGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar
            seed={row.original.name}
            variant="botttsNeutral"
            className="w-9 h-9"
          />
          <span className="font-semibold text-foreground">{row.original.name}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <CornerDownRightIcon className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize overflow-hidden">
            {row.original.instructions}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "meetingsCount",
    header: "Meetings",
    cell: ({ row }) => (
      <Badge variant="outline" className="flex items-center gap-x-2 border-transparent bg-brand-soft text-brand">
        <VideoIcon className="w-4 h-4" />
        {row.original.meetingsCount} Meeting{row.original.meetingsCount !== 1 ? "s" : ""}
      </Badge>
    ),
  },
];
