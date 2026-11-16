import Hero from "../components/home/Hero";
import AboutPreview from "../components/home/AboutPreview";
import WorkAreas from "../components/home/WorkAreas";
import ProjectsPreview from "../components/home/ProjectsPreview";
import Journey from "../components/home/Journey";
import InsightsPreview from "../components/home/InsightsPreview";
import ContactCta from "../components/home/ContactCta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <WorkAreas />
      <ProjectsPreview />
      <Journey />
      <InsightsPreview />
      <ContactCta />
    </>
  );
}