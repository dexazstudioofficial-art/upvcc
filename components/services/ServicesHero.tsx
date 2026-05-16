"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ServicesHero() {
  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      <div className="absolute inset-0 z-0 blur-xs">
        {/* Background zoom + fade — matches ProductsHero exactly */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80"
            alt="SAM Enterprises Services"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Gradient fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
        />
      </div>

      <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 pb-16">
        {/* Label */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="label-sm mb-4"
        >
          What We Offer
        </motion.p>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tight text-foreground leading-none mb-6">
          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="block"
          >
            Our Services
          </motion.span>

          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="block italic font-extralight"
          >
            Built Around You
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm max-w-xl leading-relaxed"
        >
          From free site consultation to professional installation and
          after-sales support — every service is designed to give you a
          seamless experience.
        </motion.p>
      </div>
    </section>
  );
}
