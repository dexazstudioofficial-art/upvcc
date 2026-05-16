"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  MessageSquare, CheckCheck, Mail, Phone,
  Loader2, MapPin, Target, DollarSign, Package, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Enquiry {
  id:              string;
  name:            string;
  phone:           string;
  alternatePhone?: string;
  email?:          string;
  productName?:    string;
  purpose?:        string;
  location?:       string;
  quantity?:       string;
  budget?:         string;
  message:         string;
  status:          string;
  createdAt:       string;
}

const STATUS_TABS = ["all", "new", "read", "replied"];

const STATUS_COLOR: Record<string, string> = {
  new:     "bg-red-900/60 text-red-300 border border-red-800",
  read:    "bg-blue-900/60 text-blue-300 border border-blue-800",
  replied: "bg-green-900/60 text-green-300 border border-green-800",
};

const STATUS_DOT: Record<string, string> = {
  new:     "bg-red-400",
  read:    "bg-blue-400",
  replied: "bg-green-400",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("all");
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const q   = tab !== "all" ? `?status=${tab}` : "";
      const res = await fetch(`/api/cms/enquiries${q}`, { credentials: "include" });
      const data = await res.json();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load enquiries"); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/cms/enquiries", {
        method:      "PATCH",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        await load();
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch { toast.error("Network error"); }
    setUpdating(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete enquiry from "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/cms/enquiries", {
        method:      "DELETE",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Enquiry deleted");
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
      }
    } catch { toast.error("Network error"); }
    setDeleting(null);
  }

  async function replyOnWhatsApp(e: Enquiry) {
    const num  = e.phone.replace(/\D/g, "");
    const text = [
      `Hello ${e.name},`,
      ``,
      `Thank you for your enquiry about *${e.productName || "our products"}*.`,
      ``,
      `We have received your request and will get back to you shortly.`,
      ``,
      `— SAM Enterprises`,
    ].join("\n");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, "_blank");
    if (e.status !== "replied") await updateStatus(e.id, "replied");
  }

  const counts = {
    all:     enquiries.length,
    new:     enquiries.filter((e) => e.status === "new").length,
    read:    enquiries.filter((e) => e.status === "read").length,
    replied: enquiries.filter((e) => e.status === "replied").length,
  };

  return (
    <AdminShell title="Enquiries" subtitle="Customer enquiries submitted via the website">

      {/* Status Tabs */}
      <div className="flex gap-0 border-b border-gray-800 mb-6 overflow-x-auto">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-3 text-sm capitalize border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === s ? "border-white text-white font-medium" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            {s}
            {s !== "all" && counts[s as keyof typeof counts] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                s === "new" ? "bg-red-900 text-red-300" :
                s === "read" ? "bg-blue-900 text-blue-300" :
                "bg-green-900 text-green-300"
              }`}>
                {counts[s as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-800 text-gray-600">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
          No enquiries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id}
              className={`bg-gray-900 border transition-colors ${
                e.status === "new" ? "border-red-900/50" :
                e.status === "read" ? "border-blue-900/30" :
                "border-gray-800"
              }`}>

              <div className="flex items-start justify-between gap-3 flex-wrap p-4 md:p-5">
                <div className="flex-1 min-w-0">
                  {/* Name + status */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[e.status] ?? "bg-gray-500"}`} />
                      <p className="text-sm font-bold text-white">{e.name}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 font-bold tracking-widest uppercase rounded ${
                      STATUS_COLOR[e.status] ?? "bg-gray-800 text-gray-400"
                    }`}>
                      {e.status}
                    </span>
                    {e.productName && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded truncate max-w-[160px]">
                        {e.productName}
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Phone size={10} /> {e.phone}
                    </span>
                    {e.alternatePhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {e.alternatePhone} (alt)
                      </span>
                    )}
                    {e.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> {e.email}
                      </span>
                    )}
                    <span className="text-gray-600">{new Date(e.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Extra fields */}
                  {(e.purpose || e.location || e.quantity || e.budget) && (
                    <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-400">
                      {e.purpose  && <span className="flex items-center gap-1"><Target size={10} /> {e.purpose}</span>}
                      {e.location && <span className="flex items-center gap-1"><MapPin size={10} /> {e.location}</span>}
                      {e.quantity && <span className="flex items-center gap-1"><Package size={10} /> Qty: {e.quantity}</span>}
                      {e.budget   && <span className="flex items-center gap-1"><DollarSign size={10} /> {e.budget}</span>}
                    </div>
                  )}

                  {/* Message */}
                  <p className="text-sm text-gray-300 leading-relaxed bg-gray-800 px-3 py-2 border-l-2 border-gray-600">
                    {e.message}
                  </p>
                </div>

                {/* Action buttons - larger touch targets */}
                <div className="flex flex-row md:flex-col gap-2 flex-wrap">
                  {e.status === "new" && (
                    <button onClick={() => updateStatus(e.id, "read")}
                      disabled={updating === e.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs bg-blue-900/50 text-blue-300 hover:bg-blue-900 transition-colors border border-blue-800 disabled:opacity-50 min-h-[40px]">
                      {updating === e.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                      Mark Read
                    </button>
                  )}
                  {e.status !== "replied" && (
                    <button onClick={() => updateStatus(e.id, "replied")}
                      disabled={updating === e.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-900/50 text-green-300 hover:bg-green-900 transition-colors border border-green-800 disabled:opacity-50 min-h-[40px]">
                      <CheckCheck size={12} /> Mark Replied
                    </button>
                  )}
                  <button onClick={() => replyOnWhatsApp(e)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#25D366]/20 text-green-300 hover:bg-[#25D366]/30 transition-colors border border-green-900 min-h-[40px]">
                    <MessageSquare size={12} /> Reply on WA
                  </button>
                  {e.status === "replied" && (
                    <button onClick={() => updateStatus(e.id, "new")}
                      disabled={updating === e.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-700 disabled:opacity-50 min-h-[40px]">
                      Reset
                    </button>
                  )}
                  {/* DELETE button */}
                  <button onClick={() => handleDelete(e.id, e.name)}
                    disabled={deleting === e.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-950/50 text-red-400 hover:bg-red-900/50 transition-colors border border-red-900 disabled:opacity-50 min-h-[40px]">
                    {deleting === e.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
