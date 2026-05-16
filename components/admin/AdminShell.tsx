"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X } from "lucide-react";

export default function AdminShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide in on open */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — full width on mobile */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        {/* Page header with hamburger on mobile */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-800 bg-gray-900 flex items-center gap-4">
          {/* Hamburger — only on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors -ml-1"
            aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black text-white truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
