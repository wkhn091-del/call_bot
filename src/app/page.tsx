import { Audience } from "@/components/home/Audience";
import { BookSection } from "@/components/home/BookSection";
import { CallDemo } from "@/components/home/CallDemo";
import { Comparison } from "@/components/home/Comparison";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { HoursCalculator } from "@/components/home/HoursCalculator";
import { NightRoadmap } from "@/components/home/NightRoadmap";
import { NightVoices } from "@/components/home/NightVoices";
import { StickyCta } from "@/components/home/StickyCta";
import { TrustBand } from "@/components/home/TrustBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { faq } from "@/content/home";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env/public";
import { leadsLocked } from "@/lib/env/server";

export default function HomePage() {
  const url = publicEnv.NEXT_PUBLIC_SITE_URL;
  const hasCalendly = Boolean(publicEnv.NEXT_PUBLIC_CALENDLY_URL);
  const orgEmail = site.contact.privacyEmail ?? site.contact.salesEmail;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${url}/#org`,
              name: site.legal.legalName ?? site.company,
              url,
              email: orgEmail ?? undefined,
              brand: { "@type": "Brand", name: site.brand },
              contactPoint: orgEmail
                ? {
                    "@type": "ContactPoint",
                    contactType: "sales",
                    email: orgEmail,
                    availableLanguage: ["Hebrew", "he"],
                  }
                : undefined,
            },
            {
              "@type": "SoftwareApplication",
              name: site.brand,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              inLanguage: "he",
              description: site.description,
              publisher: { "@id": `${url}/#org` },
              offers: {
                "@type": "Offer",
                priceCurrency: "ILS",
                description: "תמחור לפי שיחה, בלי מנוי חודשי קבוע. הצעה מדויקת בדמו.",
                url: `${url}/pricing`,
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ],
        }}
      />
      <Hero hasCalendly={hasCalendly} />
      <TrustBand />
      <NightVoices />
      <HoursCalculator />
      <CallDemo />
      <NightRoadmap />
      <Audience />
      <Comparison />
      <Faq items={faq} />
      <BookSection hasCalendly={hasCalendly} locked={leadsLocked} />
      <StickyCta />
    </>
  );
}
