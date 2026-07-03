import type { Metadata } from "next";
import BioSection from "@/components/about/BioSection";
import TechStackSection from "@/components/about/TechStackSection";
import WorkTimeline from "@/components/about/WorkTimeline";
import ProjectsTimeline from "@/components/about/ProjectsTimeline";
import HonorsSection from "@/components/about/HonorsSection";
import GitHubStats from "@/components/about/GitHubStats";
import ContactLinks from "@/components/about/ContactLinks";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hao Liu — Full-Stack Developer. Yunnan University MSE. Java Spring Boot + Vue 3. Technical writing.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 space-y-16 sm:space-y-24">
      <BioSection />
      <TechStackSection />
      <WorkTimeline />
      <ProjectsTimeline />
      <HonorsSection />
      <GitHubStats />
      <ContactLinks />
    </div>
  );
}
