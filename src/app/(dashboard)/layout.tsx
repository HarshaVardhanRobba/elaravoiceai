import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/DashboardSidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/DashboardNavbar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0e0d0c]">

        {/* Sidebar */}
        <DashboardSidebar />

        {/* Content */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col p-2 md:py-2 md:pl-0 md:pr-2">
          <div className="app-glow flex flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10">
            <DashboardNavbar />

            <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;