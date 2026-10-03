import Image from "next/image";
import { Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iits } from "@/data/iits";
import { cn } from "@/lib/utils";

export function ParticipatingIITs() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Pan-IIT Collaboration"
          title="Participating Institutes"
          description="Hello FOSS brings together students and maintainers across multiple IITs into one shared open-source program."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {iits.map((iit) => (
            <div
              key={iit.id}
              className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-md border border-border-strong p-2.5",
                  iit.logo ? "bg-zinc-950" : "bg-background"
                )}
              >
                {iit.logo ? (
                  <Image
                    src={iit.logo}
                    alt={`${iit.name} coding club logo`}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Landmark
                    className="h-6 w-6 text-accent"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{iit.shortName}</h3>
                <p className="mt-1 text-sm text-muted">{iit.city}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
