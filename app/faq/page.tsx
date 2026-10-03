import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { FAQList } from "@/components/faq/FAQList";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Hello FOSS.",
};

export default function FAQPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Can't find what you're looking for? Reach out through our community channels."
      />
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <FAQList faqs={faqs} />
        </div>
      </Container>
    </>
  );
}
