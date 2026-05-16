import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceCatalogue from "@/components/services/ServiceCatalogue";
import ProductFeatures from "@/components/products/ProductFeatures";
import ProductsCTA from "@/components/products/ProductsCTA";

export const metadata: Metadata = {
  title: "Services — SAM Enterprises",
  description: "Browse our complete range of professional UPVC services.",
  alternates: { canonical: "https://samenterprises.net/services" },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-0">
        <ServicesHero />
        <ServiceCatalogue />
        <ProductFeatures />
        <ProductsCTA />
      </main>
      <Footer />
    </div>
  );
}
