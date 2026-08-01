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
      title: "Engineering & Research",
      company: "Engramme (fka. Memory Machines)",
      date: "Dec 2025 – Sep 2026",
      globePinId: "sf",
      bullets: [
        "Led the **entity prediction** work. Given a search query, figure out which people it involves. I benchmarked linear and RBF SVMs, label propagation, and retrieval voting over a **19,393-memory, 4,856-entity** knowledge graph, scoring against **1,367 real user feedback documents**. Retrieval voting won at **73.3% top-1** and **55.6% on hard queries** where the person's name never appears in the query text. Both numbers undercount, since ground truth only covered people attached to memories the user had already rated, so a right answer outside that set scored as a miss",
        "Sole author of the technical report. Embeddings turned out to carry topic and very little about who was involved, so the system that won uses them only to find similar memories and then reads the people off whatever comes back",
        "Built **five clients on top of that API** (iOS, macOS, Chrome extension, web, Meta Ray-Bans) as the surfaces investors actually held during the seed raise; the round closed, the names and the number go public soon",
        "Contributed to a research blog post grounded in a real study on what people need to recall in daily life; helped collect and analyze a **1,940-question dataset from a 134-person Prolific study** across 18 memory categories",
        "Shipped the **macOS and iOS apps end-to-end in Swift**: wrote an algorithm that detects to-do items from screen context and cross-references them with active work to passively track task progress; **cut API costs by 75%** through smart batching and deduplication",
        "Owned beta tester onboarding and feedback cycles; ran competitive evaluations against other memory products",
        "Converted to a full-time offer; deferred the start to take a gap year",
        "Human memory lab spun out of Harvard, at seed"
      ]
    },
    {
      title: "Facilitator",
      company: "Rev (NU Student Club)",
      date: "Aug 2025 – Present",
      bullets: [
        "Produced engaging social media videos that **increased visibility and attendance** at club information sessions",
        "Reviewed **30+ membership applications** and identified top candidates for interviews",
        "Helped lead candidate evaluations and interviews, selecting members best positioned to contribute to Rev's mission"
      ]
    },
    {
      title: "Data Science Tutor",
      company: "Knack",
      date: "Jan 2025 – Present",
      bullets: [
        "Achieved a **5-star rating** by guiding **10 students** to improve their academic performance and strengthen Python programming",
        "Delivered personalized instruction in **Pandas, NumPy, statistics, and EDA**, enabling students to apply data science concepts"
      ]
    },
  ]
};
