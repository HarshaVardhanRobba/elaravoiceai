import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsSearchFilter = () => {
    const [filters, setFilter] = useMeetingsFilters();

    return (
        <div className="relative w-64">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                className="w-full rounded-full pl-10" placeholder="Filter by name" 
                value={filters.search} 
                onChange={(e) => setFilter({ search: e.target.value })} 
            />
        </div>
    )
}