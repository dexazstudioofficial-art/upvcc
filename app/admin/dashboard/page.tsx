export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { Package, Image, MessageSquare, Activity, BookOpen, Wrench } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [products, services, blogs, media, enquiries, recentLogs] = await Promise.all([
    db.product.count(),
    db.serviceItem.count(),
    db.blog.count(),
    db.media.count(),
    db.enquiry.count({ where: { status: "new" } }),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Products",      value: products,  icon: Package,       href: "/admin/products",  color: "text-blue-400"    },
    { label: "Services",      value: services,  icon: Wrench,        href: "/admin/services",  color: "text-emerald-400" },
    { label: "Blog Posts",    value: blogs,     icon: BookOpen,      href: "/admin/blog",      color: "text-violet-400"  },
    { label: "Media Files",   value: media,     icon: Image,         href: "/admin/media",     color: "text-purple-400"  },
    { label: "New Enquiries", value: enquiries, icon: MessageSquare, href: "/admin/enquiries", color: "text-amber-400"   },
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back. Here's what's happening.">
      {/* Stats grid - responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="bg-gray-900 border border-gray-800 p-4 hover:border-gray-600 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <Icon size={18} className={`${color} opacity-80`} />
              <span className="text-[9px] text-gray-600 group-hover:text-gray-400 tracking-widest uppercase hidden sm:block">View →</span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions - responsive wrap */}
      <div className="mb-8">
        <h2 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/products",  label: "+ Add Product"      },
            { href: "/admin/services",  label: "+ Add Service"      },
            { href: "/admin/blog",      label: "+ New Blog Post"    },
            { href: "/admin/media",     label: "+ Upload Media"     },
            { href: "/admin/settings",  label: "Edit Settings"      },
            { href: "/admin/pages",     label: "Edit Pages"         },
            { href: "/admin/enquiries", label: "View Enquiries"     },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 text-xs text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-3">Recent Activity</h2>
        <div className="bg-gray-900 border border-gray-800">
          {recentLogs.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-600 text-center">No activity yet.</p>
          )}
          {recentLogs.map((log, i) => (
            <div key={log.id}
              className={`flex items-start gap-3 px-4 py-3 ${i < recentLogs.length - 1 ? "border-b border-gray-800" : ""}`}>
              <Activity size={12} className="text-gray-600 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500"> on </span>
                  <span className="text-gray-300">{log.entity}</span>
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{log.admin.name} · {new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
