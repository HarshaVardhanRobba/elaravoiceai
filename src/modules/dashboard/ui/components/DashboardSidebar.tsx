"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { VideoIcon, BotIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { DashboardUserButton } from "./DashboardUserButton";
import { DashboardTrial } from "./DashboardTrial";
import Image from "next/image";

const firstSectionItems = [
  { icon: VideoIcon, label: "Meetings", href: "/meetings" },
  { icon: BotIcon, label: "Agents", href: "/agents" },
];

const secondSectionItems = [
  { icon: StarIcon, label: "Upgrade", href: "/upgrade" },
];

const itemClass = (active: boolean) =>
  cn(
    "h-11 rounded-2xl px-3.5 text-sidebar-foreground/70 transition-colors",
    "hover:bg-white/5 hover:text-white",
    active && "bg-sidebar-accent text-white"
  );

const renderItems = (
  items: { icon: typeof VideoIcon; label: string; href: string }[],
  pathname: string
) =>
  items.map((item) => {
    const active = pathname === item.href;
    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton asChild className={itemClass(active)}>
          <Link href={item.href} className="flex items-center gap-3">
            <item.icon className={cn("h-[18px] w-[18px]", active && "text-brand")} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      className="border-0 bg-transparent text-sidebar-foreground"
    >
      <SidebarHeader className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" width={26} height={26} alt="logo" />
          <span className="font-display text-xl font-semibold leading-none tracking-tight text-white">
            Elara
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3.5 text-xs font-medium text-sidebar-foreground/50">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(firstSectionItems, pathname)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3.5 text-xs font-medium text-sidebar-foreground/50">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(secondSectionItems, pathname)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto space-y-3 px-2 pb-3">
        <DashboardTrial />
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};
