import { site } from "./site";

/**
 * Content for the public pages (Batch 02).
 * Anything with `placeholder: true` is temporary: replace it with real facts.
 * Skill lists and the mission statement are DRAFT wording: edit to match reality.
 * In Batch 06 this content moves to the database.
 */

export interface TimelineItem {
  title: string;
  organisation: string;
  period: string;
  description: string;
  placeholder?: boolean;
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectDetails {
  overview: string;
  focusAreas: string[];
  statusNote: string;
  links: ProjectLink[];
}

export const aboutContent = {
  lead: "Henry Mutuma Gichunge is an educator, software developer and entrepreneur who builds practical digital solutions for education and small business.",
  story: [
    "Henry Mutuma Gichunge works where teaching and technology meet. Experience in the classroom shows him what teachers and learners actually need; software development lets him build it.",
    "His current work focuses on education technology, including MathOS for assessment and learner performance, BrightMe for learning and revision, and ManageMe OS, a planned platform for small business operations.",
    "A fuller biography, with qualifications, experience and milestones, will be added here once confirmed.",
  ],
  mission:
    "To use teaching experience and practical software to make education and everyday work simpler, fairer and more effective.",
  principles: [
    {
      title: "Practical first",
      text: "Every tool starts from a real problem seen in a classroom or a small business.",
    },
    {
      title: "Honest about progress",
      text: "Products are described as they are: operational, in development or planned.",
    },
    {
      title: "Built to last",
      text: "Clean structure, careful security and maintainable code over quick tricks.",
    },
  ],
};

export const experience: TimelineItem[] = [
  {
    title: "Teaching role",
    organisation: "Organisation to be confirmed",
    period: "Years to be confirmed",
    description:
      "Teaching and classroom experience will be described here once the details are confirmed.",
    placeholder: true,
  },
  {
    title: "Product development",
    organisation: "Organisation to be confirmed",
    period: "Years to be confirmed",
    description:
      "Designing and building education and business software, including MathOS, BrightMe and ManageMe OS.",
    placeholder: true,
  },
];

export const educationHistory: TimelineItem[] = [
  {
    title: "Qualification",
    organisation: "Institution to be confirmed",
    period: "Years to be confirmed",
    description: "Academic and professional qualifications will be listed here.",
    placeholder: true,
  },
  {
    title: "Professional training",
    organisation: "Institution to be confirmed",
    period: "Years to be confirmed",
    description: "Courses, certifications and professional development will be listed here.",
    placeholder: true,
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Education",
    items: [
      "Classroom teaching",
      "Assessment and grading",
      "CBC performance analysis",
      "Timetable planning",
    ],
  },
  {
    title: "Technology",
    items: ["React", "TypeScript", "Tailwind CSS", "Cloudflare Workers", "Web application design"],
  },
];

export const educationContent = {
  intro:
    "Teaching is the foundation of everything on this site: the questions, the products and the standards.",
  teachingBackground: [
    "Henry is an educator whose classroom experience shapes the technology he builds.",
    "Specific schools, levels and years of teaching will be added here once confirmed.",
  ],
  subjects: ["Subjects taught: to be added"],
  interests: [
    "Assessment and grading",
    "CBC performance analysis",
    "Learner progress tracking",
    "Timetables and school workflows",
    "Digital learning and revision support",
  ],
  edtechIntro:
    "Education technology is where teaching experience and software development meet. These projects come directly from that work.",
  relatedProjectSlugs: ["mathos", "brightme"],
};

export const cvContent = {
  summary:
    "Educator, technology creator and entrepreneur building practical digital solutions for education and small business.",
  // Set to the uploaded PDF address in Batch 09, e.g. "/files/henry-gichunge-cv.pdf"
  pdfUrl: "",
};

export const contactContent = {
  intro:
    "For projects, collaboration or a conversation about education and technology, you are welcome to reach out.",
  email: site.email,
  phone: "", // PLACEHOLDER: add when ready
  location: "", // PLACEHOLDER: add when ready
  socials: [] as SocialLink[], // PLACEHOLDER: add real profile links
};

export const projectDetails: Record<string, ProjectDetails | undefined> = {
  mathos: {
    overview:
      "MathOS is an education technology platform designed to help teachers manage assessment, learner performance, grading and educational workflows in one place.",
    focusAreas: [
      "Assessment management",
      "CBC performance analysis",
      "Merit lists",
      "KJSEA-related assessment tools",
      "Timetable generation",
      "Teacher productivity",
    ],
    statusNote:
      "MathOS is a developing product. Features and availability may change as it matures.",
    links: [],
  },
  brightme: {
    overview:
      "BrightMe is a smart learning and revision platform focused on helping learners access educational resources and digital learning support.",
    focusAreas: ["Access to educational resources", "Digital learning support", "Revision support"],
    statusNote:
      "The current status of BrightMe is still to be confirmed. More detail will be added here.",
    links: [],
  },
  manageme: {
    overview:
      "ManageMe OS is a planned business management platform aimed at helping small businesses manage services, sales, payments and daily operations.",
    focusAreas: ["Service management", "Sales tracking", "Payments", "Daily business operations"],
    statusNote: "ManageMe OS is planned and is not yet available.",
    links: [],
  },
};