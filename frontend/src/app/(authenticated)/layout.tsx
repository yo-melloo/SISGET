"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { LayoutProvider, useLayout } from "@/components/layout/LayoutContext";

function AuthenticatedLayoutShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen flex transition-colors">
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar />

        <main className="mt-20 p-8 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <AuthenticatedLayoutShell>{children}</AuthenticatedLayoutShell>
    </LayoutProvider>
  );
}
