import {
  Code2,
  GraduationCap,
  Lightbulb,
  Wrench,
  MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";

/**
 * All website content for Batch 01.
 * Items marked PLACEHOLDER are temporary and must be replaced with real facts.
 * In Batch 06 this content moves to the database.
 */

export type ProjectStatus =
  | "Operational"
  | "In development"
  | "Planned"
  | "Status to confirm";

export interface Project {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  summary: string;
  image?: string; // optional screenshot path, e.g. "/images/mathos.png"
}

export const site = {
  name: "Henry Gichunge",
  fullName: "Henry Mutuma Gichunge",
  domain: "henrygichunge.com",
  taglineWords: ["Ideas", "Education", "Innovation"],
  roles: ["Educator", "Technology creator", "Entrepreneur"],
  intro:
    "I teach, build software and develop practical digital solutions that make education and everyday business work better.",
  // Put your photo in public/images/ and set e.g. "/images/henry.jpg"
  portraitSrc: "",
  email: "", // PLACEHOLDER: add when ready

  nav: [
    { label: "About", to: "/about" },
    { label: "Projects", to: "/projects" },
    { label: "Education", to: "/education" },
    { label: "Insights", to: "/insights" },
    { label: "CV", to: "/cv" },
  ],

  about: [
    "Henry Mutuma Gichunge works where teaching and technology meet. As an educator he understands the daily realities of the classroom; as a developer he turns those realities into practical tools.",
    "His work spans education technology, software development and entrepreneurship, guided by one question: how can well-built digital solutions make people's work simpler and their results stronger?",
  ],

  areas: [
    {
      icon: GraduationCap,
      title: "Education",
      text: "Teaching, assessment and learning practice grounded in the classroom.",
    },
    {
      icon: Code2,
      title: "Software Development",
      text: "Modern web applications built with care, structure and security.",
    },
    {
      icon: MonitorSmartphone,
      title: "Education Technology",
      text: "Tools that save teachers time and give learners better support.",
    },
    {
      icon: Wrench,
      title: "Practical Solutions",
      text: "Digital systems designed around real problems, not trends.",
    },
    {
      icon: Lightbulb,
      title: "Entrepreneurship",
      text: "Turning useful ideas into products and sustainable ventures.",
    },
  ] satisfies { icon: LucideIcon; title: string; text: string }[],

  projects: [
    {
      slug: "mathos",
      name: "MathOS",
      category: "Education Technology",
      status: "In development",
      summary:
        "A platform helping teachers manage assessment, learner performance, grading and educational workflows, including CBC analysis, merit lists, KJSEA-related tools and timetable generation.",
    },
    {
      slug: "brightme",
      name: "BrightMe",
      category: "Learning Platform",
      status: "Status to confirm",
      summary:
        "A smart learning and revision platform that helps learners access educational resources and digital learning support.",
    },
    {
      slug: "manageme",
      name: "ManageMe OS",
      category: "Business Software",
      status: "Planned",
      summary:
        "A planned business management platform to help small businesses manage services, sales, payments and daily operations.",
    },
  ] as Project[],

  // PLACEHOLDER: no dates or employers are invented. Replace with real details.
  journey: [
    {
      stage: "Stage 01",
      title: "Education and Teaching",
      text: "The foundation: classroom experience and a close understanding of learners and teachers. Details to be added.",
    },
    {
      stage: "Stage 02",
      title: "Learning to Build",
      text: "Software development skills developed to solve real problems seen in education. Details to be added.",
    },
    {
      stage: "Stage 03",
      title: "Creating Products",
      text: "Turning practical ideas into platforms such as MathOS, BrightMe and ManageMe OS.",
    },
    {
      stage: "Stage 04",
      title: "Growing the Platform",
      text: "Building a lasting brand around ideas, education and innovation. Details to be added.",
    },
  ],

  // PLACEHOLDER: sample article titles only.
  insights: [
    {
      category: "Education",
      title: "Sample: What assessment data can teach us about learning",
      excerpt: "Placeholder article. Real insights will be published from the admin dashboard.",
    },
    {
      category: "Technology",
      title: "Sample: Building software for teachers, not just for demos",
      excerpt: "Placeholder article. Real insights will be published from the admin dashboard.",
    },
    {
      category: "Innovation",
      title: "Sample: From idea to product on a phone and a small budget",
      excerpt: "Placeholder article. Real insights will be published from the admin dashboard.",
    },
  ],
};