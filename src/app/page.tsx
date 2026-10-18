import { AboutSection } from "@/components/sections/about-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { ContactSection } from "@/components/sections/contact-section";
import { DeliverySection } from "@/components/sections/delivery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { SubscriptionSection } from "@/components/sections/subscription-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <CatalogSection />
        <SubscriptionSection />
        <DeliverySection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
