import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import {
  CommandResponsiveDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem
} from "@/components/ui/command";

interface CommandSelectProps {
  options: Array<{
    id: string;
    value: string;
    children: ReactNode;
    className?: string;
    }>;
    onSelect: (value: string) => void;
    onSearch?: (value: string) => void;
    value?: string;
    placeholder?: string;
    isSearchable?: boolean;
    className?: string;
}

export function CommandSelect({
  options,
  onSelect,
  onSearch,
  value,
  placeholder = "select an Option",
  isSearchable,
  className,
}: CommandSelectProps) {
  const [open, setOpen] = useState(false);

  const handleopenChange = (open: boolean) => {
    onSearch?.("");
    setOpen(open);
  };

  const selectedOption = options.find((option) => option.id === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-full border border-input bg-white/5 px-4 text-sm",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <div>
            {selectedOption?.children ?? placeholder}
        </div>
        <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
      </button>
      <CommandResponsiveDialog 
        open={open} 
        onOpenChange={handleopenChange}
        shouldFilter={!onSearch}
        >
        <CommandInput
          placeholder="Search..."
          onValueChange={onSearch}
        />

      <CommandList>
        <CommandEmpty>
            <span>No results found.</span>
        </CommandEmpty>

        {options.map((option) => (
          <CommandItem
            key={option.id}
            onSelect={() => {
              onSelect(option.value);
              setOpen(false);
            }}
            className={option.className}
          >
            {option.children}
          </CommandItem>
        ))}
      </CommandList>
    </CommandResponsiveDialog>
    </>
  );
}