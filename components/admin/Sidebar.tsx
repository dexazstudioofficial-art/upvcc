"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, FileText, Settings,
  Image as ImageIcon, Link2, LogOut, ChevronRight,
  Users, MessageSquare, Star, BookOpen, Wrench, X,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// ✅ CORRECT LOGICAL MAPPING:
// Admin "Products" → /admin/products → manages Product DB → shows in public Products
// Admin "Services" → /admin/services → manages ServiceItem DB → shows in public Services
const NAV = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Products",     href: "/admin/products",     icon: Package         },
  { label: "Services",     href: "/admin/services",     icon: Wrench          },
  { label: "Blog",         href: "/admin/blog",         icon: BookOpen        },
  { label: "Pages",        href: "/admin/pages",        icon: FileText        },
  { label: "Media",        href: "/admin/media",        icon: ImageIcon       },
  { label: "Links",        href: "/admin/links",        icon: Link2           },
  { label: "Team",         href: "/admin/team",         icon: Users           },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star            },
  { label: "Enquiries",    href: "/admin/enquiries",    icon: MessageSquare   },
  { label: "Settings",     href: "/admin/settings",     icon: Settings        },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: SidebarProps) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full min-h-screen">

      {/* Logo + mobile close */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 overflow-hidden rounded-md bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/SAM_ENT.png"
              alt="SAM Enterprises"
              className="object-contain w-10 h-10"
            />
          </div>
          <div className="leading-none">
            <p className="text-xs font-black tracking-widest text-white">SAM</p>
            <p className="text-[10px] text-gray-500 tracking-widest">CMS PANEL</p>
          </div>
        </div>

        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 text-sm transition-colors group rounded-sm",
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}>
              <Icon
                size={16}
                className={active ? "text-white shrink-0" : "text-gray-500 group-hover:text-white shrink-0"}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-gray-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-3 w-full text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors rounded-sm">
          <LogOut size={16} className="shrink-0" />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
