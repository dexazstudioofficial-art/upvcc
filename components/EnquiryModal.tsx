"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Check, Phone, ArrowRight } from "lucide-react";

export interface EnquiryProduct {
  name:        string;
  category:    string;
  image:       string;
  specs:       string[];
  features:    string[];
  description: string;
  context?:    "product" | "service";
}

interface EnquiryModalProps {
  product: EnquiryProduct;
  onClose: () => void;
}

function buildWhatsAppMessage(
  product: EnquiryProduct,
  name: string, phone: string, altPhone: string,
  note: string, purpose: string, location: string,
  quantity: string, budget: string,
) {
  const isService = product.context === "service";
  const lines = [
    `*New ${isService ? "Service" : "Product"} Enquiry — SAM Enterprises*`,
    ``,
    `*${isService ? "Service" : "Product"}:* ${product.name}`,
    `*Category:* ${product.category}`,
    product.specs.length > 0 ? `*Specifications:* ${product.specs.join(", ")}` : "",
    ``,
    `*Customer Details*`,
    `Name: ${name || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    altPhone  ? `Alternate Phone: ${altPhone}` : "",
    purpose   ? `Purpose: ${purpose}`          : "",
    location  ? `Location: ${location}`        : "",
    quantity  ? `Quantity: ${quantity}`         : "",
    budget    ? `Budget: ${budget}`             : "",
    note      ? `Note: ${note}`                 : "",
    ``,
    `_Sent via samenterprises.net_`,
  ].filter((l) => l !== "");
  return encodeURIComponent(lines.join("\n"));
}

export default function EnquiryModal({ product, onClose }: EnquiryModalProps) {
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [altPhone,   setAltPhone]   = useState("");
  const [note,       setNote]       = useState("");
  const [purpose,    setPurpose]    = useState("");
  const [location,   setLocation]   = useState("");
  const [quantity,   setQuantity]   = useState("");
  const [budget,     setBudget]     = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");
  const [sitePhone,      setSitePhone]      = useState("+91 98765 43210");
  const [submitted,  setSubmitted]  = useState(false);
  const [saving,     setSaving]     = useState(false);

  const isService  = product.context === "service";
  const buttonText = isService ? "Book a Service Enquiry" : "Order Now";

  useEffect(() => {
    fetch("/api/public/settings?keys=whatsapp_number,phone_primary")
      .then((r) => r.json())
      .then((d: Record<string, string>) => {
        if (d.whatsapp_number) setWhatsappNumber(d.whatsapp_number.replace(/\D/g, ""));
        if (d.phone_primary)   setSitePhone(d.phone_primary);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/cms/enquiries", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           name.trim(),
          phone:          phone.trim(),
          alternatePhone: altPhone.trim() || null,
          productName:    product.name,
          purpose:        purpose.trim()  || null,
          location:       location.trim() || null,
          quantity:       quantity.trim() || null,
          budget:         budget.trim()   || null,
          message:        note.trim()     || `Enquiry about ${product.name}`,
        }),
      });
    } catch {}

    const msg = buildWhatsAppMessage(
      product, name, phone, altPhone,
      note, purpose, location, quantity, budget,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h3 className="text-xl font-black mb-2">Enquiry Sent!</h3>
          <p className="text-sm text-gray-500 mb-6">
            Your WhatsApp has been opened with your enquiry pre-filled. Our team will respond within 2 hours.
          </p>
          <button onClick={onClose}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-xl";

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b shrink-0">
          {product.image && (
            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase text-gray-400 mb-0.5">{product.category}</p>
            <h3 className="font-black text-lg leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* Form - scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm font-semibold text-gray-700">
            Fill in your details and we'll connect you instantly via WhatsApp.
          </p>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Full name" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000" type="tel" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Alternate Phone
            </label>
            <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)}
              placeholder="+91 00000 00000" type="tel" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Purpose
            </label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Home / Office / Project" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Location
            </label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Your location / area" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Quantity
            </label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5 windows" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Budget
            </label>
            <input value={budget} onChange={(e) => setBudget(e.target.value)}
              placeholder="Your budget range" className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">
              Additional Notes
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific requirements..." rows={2}
              className={`${inputClass} resize-none`} />
          </div>

          <button onClick={handleSubmit} disabled={!name.trim() || !phone.trim() || saving}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 rounded-xl">
            {saving ? "Opening WhatsApp…" : <><ArrowRight size={16} /> {buttonText}</>}
          </button>

          <a href={`tel:${sitePhone.replace(/\s/g, "")}`}
            className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:border-gray-400 transition-colors rounded-xl">
            <Phone size={14} /> Call Us Instead
          </a>
        </div>
      </div>
    </div>
  );
}
