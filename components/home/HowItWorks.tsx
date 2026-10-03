import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  { number: "01", title: "Register", description: "Sign up and choose your track." },
  {
    number: "02",
    title: "Explore Projects",
    description: "Browse participating repositories.",
  },
  {
    number: "03",
    title: "Pick an Issue",
    description: "Choose an issue that fits your track.",
  },
  { number: "04", title: "Build", description: "Work through the problem locally." },
  {
    number: "05",
    title: "Submit PR",
    description: "Open a pull request against the repository.",
  },
  {
    number: "06",
    title: "Get Reviewed",
    description: "Mentors review and give feedback.",
  },
  { number: "07", title: "Contribute", description: "Your changes land in the project." },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="How It Works"
          align="center"
          className="mx-auto"
        />
        <div className="relative mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-7 lg:gap-x-6">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="font-mono text-2xl font-semibold text-accent">
                {step.number}
              </span>
              <div className="h-px w-full bg-border-strong" aria-hidden="true" />
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
