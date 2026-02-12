import About from "./About/About";
import Contact from "./Contact/Contact";
import FeaturesGrid from "./FeaturesGrid/FeaturesGrid";
import Hero from "./Hero/Hero";
import HowItWorks from "./HowItWorks/HowItWorks";
import Navigation from "./Navigation/Navigation";
import { useTour } from "../../context/TourContext";

export default function Home() {
  const { enterDemoMode } = useTour();

  return (
    <>
      <Navigation />
      <Hero onViewDemo={enterDemoMode} />
      <FeaturesGrid />
      <HowItWorks />
      <About />
      <Contact />
    </>
  );
}
