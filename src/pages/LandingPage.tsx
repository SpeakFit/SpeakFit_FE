import FeatureSection from "./landing/components/FeatureSection";
import HeroSection from "./landing/components/HeroSection";
import LandingHeader from "./landing/components/LandingHeader";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <FeatureSection />
    </>
  );
}
