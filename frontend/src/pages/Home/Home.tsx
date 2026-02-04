import FeaturesGrid from "./FeaturesGrid/FeaturesGrid";
import Footer from "./Footer/Footer";
import Hero from "./Hero/Hero";
import HowItWorks from "./HowItWorks/HowItWorks";
import Navigation from "./Navigation/Navigation";
import Pricing from "./Pricing/Pricing";

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <Footer />
    </>
  );
}
