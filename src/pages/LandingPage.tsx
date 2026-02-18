import FeatureSection from "./landing/components/FeatureSection";
import FooterSection from "./landing/components/FooterSection";
import HeroSection from "./landing/components/HeroSection";
import LandingHeader from "./landing/components/LandingHeader";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <FeatureSection />
      <FooterSection />
    </>
  );
}
