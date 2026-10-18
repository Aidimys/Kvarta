import { AboutSection } from "@/components/sections/about-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { HeroSection } from "@/components/sections/hero-section";
import { SiteHeader } from "@/components/sections/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <CatalogSection />
      </main>
    </>
  );
}
