"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/lib/useSiteSettings";

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function ContactInfo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  const { get } = useSiteSettings([
    "phone_primary", "phone_secondary", "email_info", "email_sales",
    "address_line1", "address_line2",
  ]);

  const phone1   = get("phone_primary",   "+91 98765 43210");
  const phone2   = get("phone_secondary", "+91 44 2345 6789 (Office)");
  const email1   = get("email_info",      "info@samenterprises.com");
  const email2   = get("email_sales",     "sales@samenterprises.com");
  const address1 = get("address_line1",   "42 Industrial Estate, Phase II, Ambattur,");
  const address2 = get("address_line2",   "Chennai, Tamil Nadu 600096");

  const contactDetails = [
    {
      icon: Phone, label: "Phone",
      content: (
        <>
          <a href={`tel:${phone1.replace(/\s/g, "")}`} className="text-sm text-black hover:opacity-60 transition-opacity block">{phone1}</a>
          {phone2 && <a href={`tel:${phone2.replace(/\s/g, "")}`} className="text-sm text-black hover:opacity-60 transition-opacity block">{phone2}</a>}
        </>
      ),
    },
    {
      icon: Mail, label: "Email",
      content: (
        <>
          <a href={`mailto:${email1}`} className="text-sm text-black hover:opacity-60 transition-opacity block">{email1}</a>
          {email2 && email2 !== email1 && <a href={`mailto:${email2}`} className="text-sm text-black hover:opacity-60 transition-opacity block">{email2}</a>}
        </>
      ),
    },
    {
      icon: MapPin, label: "Address",
      content: (
        <p className="text-sm text-black leading-relaxed">
          {address1}<br />{address2}
        </p>
      ),
    },
    {
      icon: Clock, label: "Working Hours",
      content: <p className="text-sm text-black leading-relaxed">Monday – Saturday, 9:00 AM – 6:00 PM</p>,
    },
  ];

  return (
    <div className="px-6 md:px-10 lg:px-16 py-20 border-r border-zinc-200 bg-white text-black">
      <div className="mb-12" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease-out" }}>
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">Get In Touch</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          We&apos;re Here<br />
          <span className="italic font-extralight text-zinc-700">To Help</span>
        </h2>
      </div>

      <div ref={ref} className="space-y-8">
        {contactDetails.map(({ icon: Icon, label, content }, i) => (
          <div key={label} className="flex items-start gap-5 transition-all duration-700 hover:translate-x-1"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(25px)", transitionDelay: `${i * 120}ms` }}>
            <div className="w-12 h-12 border border-zinc-300 flex items-center justify-center shrink-0 transition-all duration-300 hover:border-black hover:scale-110">
              <Icon size={18} className="text-zinc-700" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 tracking-widest uppercase mb-2">{label}</p>
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
