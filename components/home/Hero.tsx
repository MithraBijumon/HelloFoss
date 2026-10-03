"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RegisterMenu } from "@/components/layout/RegisterMenu";
import { siteConfig } from "@/data/site";
import { HeroGraph } from "@/components/home/HeroGraph";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Badge variant="accent">{siteConfig.tagline}</Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            A month-long open-source program bringing students from multiple
            IITs together to build, contribute and collaborate on real-world
            projects.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <RegisterMenu size="lg" />
            <Button href="/projects" variant="secondary" size="lg">
              Explore Projects
              <Compass className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <HeroGraph />
        </motion.div>
      </div>
    </section>
  );
}
