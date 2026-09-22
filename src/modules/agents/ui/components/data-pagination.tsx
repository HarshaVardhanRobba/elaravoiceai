import { Button } from "@/components/ui/button";

interface DataPaginationProps {
    totalPages: number;
    page: number;
    onPageChange: (page: number) => void;
}

export const DataPagination = ({
    totalPages,
    page,
    onPageChange,
}: DataPaginationProps) => {
    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;

    return (
        <div className="flex items-center justify-between px-1 py-3">
            {/* Mobile */}
            <div className="flex w-full items-center justify-between sm:hidden">
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages || 1}
                </span>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isFirstPage}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLastPage || totalPages === 0}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden w-full items-center justify-between sm:flex">
                <p className="text-sm text-muted-foreground">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{totalPages || 1}</span>
                </p>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isFirstPage}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLastPage || totalPages === 0}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};
