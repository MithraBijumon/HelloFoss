import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Code2, Users, GitPullRequest, Globe2 } from "lucide-react";

const features = [
  {
    title: "Real Projects",
    description: "Work on actual open-source repositories.",
    icon: Code2,
  },
  {
    title: "Mentorship",
    description: "Learn directly from project maintainers.",
    icon: Users,
  },
  {
    title: "Meaningful Contributions",
    description: "Solve real issues and contribute through GitHub.",
    icon: GitPullRequest,
  },
  {
    title: "Pan-IIT Community",
    description: "Collaborate with students across participating IITs.",
    icon: Globe2,
  },
];

export function WhyHelloFoss() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Why Hello FOSS?" title="Built for real contribution" />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
            >
              <feature.icon
                className="h-6 w-6 text-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
