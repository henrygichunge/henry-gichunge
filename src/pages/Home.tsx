import Hero from "../components/home/Hero";
import AboutPreview from "../components/home/AboutPreview";
import ProjectsPreview from "../components/home/ProjectsPreview";
import InsightsPreview from "../components/home/InsightsPreview";
import ContactCta from "../components/home/ContactCta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <ProjectsPreview />
      <InsightsPreview />
      <ContactCta />
    </>
  );
}