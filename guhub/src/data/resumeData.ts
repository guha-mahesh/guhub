export interface Education {
  school: string;
  degree: string;
  gpa: string;
  date: string;
}

export interface Experience {
  title: string;
  company: string;
  date: string;
  bullets: string[];
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
    date: "May 2028"
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
      title: "Software Engineer Co-op",
      company: "Engramme",
      date: "Dec 2025 – Sep 2026",
      bullets: [
        "Primary engineer across 5 production surfaces at a Harvard AI spinout backed by Mayfield Fund; demoed to Apple, Samsung, GitHub, and TripAdvisor",
        "Rewrote the Chrome extension's content extraction from scratch: site-specific scrapers for 10+ surfaces (Gmail, Google Docs, LinkedIn, Reddit, etc.), compact 2-char metadata encoding for email threads, viewport-only extraction, and self-referential filtering so Gmail recalls don't surface the thread you're reading",
        "Built the macOS menubar app: periodic screen capture via ScreenCaptureKit, Apple Vision OCR, Jaccard similarity gate to skip unchanged screens, and a global hotkey that grabs highlighted text from any app by simulating Cmd+C and restoring the original clipboard",
        "Building entity resolution for the extension: clusters email addresses and display-name variants into canonical recipient identities using embedding-based classification with Tukey fence downsampling for label imbalance"
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
    {
      title: "Data Science Intern",
      company: "Green Joules",
      date: "Jun 2023 – Sep 2023",
      bullets: [
        "Assessed biofuel feasibility of 11 crops by analyzing production volumes, commodity prices, and food security considerations",
        "Researched crop by-products for potential biofuel applications and presented data-driven recommendations",
        "Developed visualizations that informed strategic decision-making on the potential establishment of a biorefinery in Texas"
      ]
    }
  ]
};
