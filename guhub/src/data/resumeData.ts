export interface Education {
  school: string;
  degree: string;
  gpa: string;
  date: string;
  globePinId?: string;
}

export interface Experience {
  title: string;
  company: string;
  date: string;
  bullets: string[];
  globePinId?: string;
}

export interface ResumeData {
  education: Education;
  skills: {
    languages: string[];
    tools: string[];
  };
  experience: Experience[];
}

export const resumeData: ResumeData = {
  education: {
    school: "Northeastern University",
    degree: "Bachelor of Science in Data Science and Business Analytics with a focus in FinTech",
    gpa: "GPA: 3.8/4.0 • John Martinson Honors Program",
    date: "May 2028",
    globePinId: "boston"
  },
  skills: {
    languages: ["Python", "TypeScript", "JavaScript", "SQL"],
    tools: [
      "pandas",
      "NumPy",
      "Matplotlib",
      "Scikit-learn",
      "Jupyter",
      "Keras",
      "Docker",
      "React",
      "Flask",
      "Express.js",
      "PyTorch",
      "Torchvision",
      "AWS S3"
    ]
  },
  experience: [
    {
      title: "Engineering & Research Co-op",
      company: "Engramme (fka. Memory Machines)",
      date: "Dec 2025 – Sep 2026",
      globePinId: "sf",
      bullets: [
        "Built entity resolution for the core memory API: a KNN classifier that identifies who appears in a memory without their name being mentioned, running 353x better than random chance; shipping to production",
        "Contributed to a research blog post grounded in a real study on what people need to recall in daily life; helped collect and analyze a 1,940-question dataset from a 134-person Prolific study across 18 memory categories",
        "Built the macOS and iOS apps end-to-end in Swift: wrote an algorithm that detects to-do items from screen context and cross-references them with active work to passively track task progress; cut API costs by 75% through smart batching and deduplication",
        "Built a speaker-detection pipeline using on-device voiceprints (no cloud processing, GDPR/SOC2 compliant) for passive transcription across surfaces including Google Meet",
        "Rebuilt the Chrome extension's content extraction across 289 commits; the main surface demoed to Apple, Samsung, GitHub, and TripAdvisor",
        "Managed beta tester onboarding and feedback cycles; ran competitive evaluations against other memory products",
        "Human memory lab; Mayfield-backed at pre-seed, currently in active conversations with top-tier investors. Founded by Gabriel Kreiman (Harvard Medical School) and Spandan Madan (Harvard CS PhD)"
      ]
    },
    {
      title: "Facilitator",
      company: "Rev (NU Student Club)",
      date: "Aug 2025 – Present",
      bullets: [
        "Produced engaging social media videos that increased visibility and attendance at club information sessions",
        "Reviewed 30+ membership applications and identified top candidates for interviews",
        "Led candidate evaluations and interviews, selecting members best positioned to contribute to Rev's mission"
      ]
    },
    {
      title: "Data Science Tutor",
      company: "Knack",
      date: "Jan 2025 – Present",
      bullets: [
        "Achieved a 5-star rating by guiding 10 students to improve their academic performance and strengthen Python programming",
        "Delivered personalized instruction in Pandas, NumPy, statistics, and EDA, enabling students to apply data science concepts"
      ]
    },
  ]
};
