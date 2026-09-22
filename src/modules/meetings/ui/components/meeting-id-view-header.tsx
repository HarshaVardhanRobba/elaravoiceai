import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronRightIcon, MoreVerticalIcon, Pencil, PencilIcon, Trash2 } from "lucide-react"
import Link from "next/link"

interface MeetingIDviewHeaderProps {
    meetingId: string
    meetingname: string
    onEdit: () => void
    onremove: () => void
}

export const MeetingIDviewHeader = ({
    meetingId,
    meetingname,
    onEdit,
    onremove,
}: MeetingIDviewHeaderProps) => {
    return (
        <div className="flex items-center justify-between pt-4 pb-2 md:pt-6">
            {/* Left: Breadcrumb + Title */}
            <div className="space-y-1">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-display text-2xl font-semibold tracking-tight text-muted-foreground">
                                <Link href="/agents">My Meetings
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRightIcon className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-display text-2xl font-semibold tracking-tight text-foreground">
                                <Link href={`/agents/${meetingId}`}>
                                    {meetingname}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <p className="text-sm text-muted-foreground">
                    Meeting ID: {meetingId}
                </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" size="icon"
                        >
                            <MoreVerticalIcon/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <PencilIcon className="mr-2 h-4 w-4 text-foreground" />
                            Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={onremove}>
                            <Trash2 className="mr-2 h-4 w-4 text-lg" />
                            Delete
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
