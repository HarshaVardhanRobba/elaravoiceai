"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  PanelLeftCloseIcon,
  PanelLeftIcon,
  SearchIcon,
} from "lucide-react";
import { DashboardCommand } from "./DashboardCommand";
import { useEffect, useState } from "react";

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />

      <nav className="flex items-center gap-x-3 px-4 py-4 sm:px-6">

        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={toggleSidebar}
        >
          {(state === "collapsed" || isMobile) ? (
            <PanelLeftIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
        </Button>

        {/* Search */}
        <Button
          variant="outline"
          className="glass h-10 w-full max-w-md justify-start gap-2 rounded-full font-normal text-muted-foreground shadow-none hover:bg-white/10"
          onClick={() => setCommandOpen((open) => !open)}
        >
          <SearchIcon className="h-4 w-4" />
          <span className="flex-1 text-left">Search meetings, agents...</span>
          <kbd className="pointer-events-none rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs">
            ⌘K
          </kbd>
        </Button>
      </nav>
    </>
  );
};