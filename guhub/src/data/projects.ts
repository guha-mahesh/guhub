import type { GalaxyType } from './galaxyData';

export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  galaxies: GalaxyType[];
  color: string;
  image: string;
  github: string;
  private?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "BioClock",
    description: "CNN trained on satellite imagery to predict local biodiversity. 80% accuracy after dataset augmentation. Uses Google Earth Engine for image sourcing.",
    tech: ["Python", "PyTorch", "Google Earth Engine", "Torchvision"],
    galaxies: ['geography', 'animals'],
    color: "greenGradient",
    image: "BioClock.png",
    github: "https://github.com/guha-mahesh/BioClock"
  },
  {
    id: 2,
    title: "FlightScope",
    description: "Web app that tells you when and where to go birdwatching. Fits Poisson regression models per species using location-based environmental features to predict sighting probability.",
    tech: ["Python", "Flask", "React", "Scikit-learn"],
    galaxies: ['geography', 'animals'],
    color: "blueGradient",
    image: "flightscope.png",
    github: "https://github.com/guha-mahesh/FlightScope"
  },
  {
    id: 3,
    title: "Policy Playground",
    description: "Regression models for forecasting financial markets paired with a policy recommender system. Built to make macroeconomic policy exploration more interactive.",
    tech: ["Python", "Flask", "MySQL", "Scikit-learn"],
    galaxies: ['philosophy'],
    color: "purpleGradient",
    image: "PolicyPlayground.png",
    github: "https://github.com/guha-mahesh/PolicyPlayground"
  },
  {
    id: 4,
    title: "ClubStop",
    description: "Full-stack platform for students to find and rate university clubs across five metrics. Sortable by flair, with user auth and a club management interface.",
    tech: ["React", "TypeScript", "MySQL", "Express.js"],
    galaxies: ['culture'],
    color: "orangeGradient",
    image: "ClubStop.png",
    github: "https://github.com/guha-mahesh/ClubStop"
  },
  {
    id: 5,
    title: "Monkroyer",
    description: "Social bingo game built around real-money leagues. Friends submit bingo items about each other, vote on completions, and compete on leaderboards. JWT auth, AWS S3, full league management.",
    tech: ["React", "TypeScript", "Flask", "PostgreSQL", "AWS S3", "JWT"],
    galaxies: ['culture'],
    color: "greenGradient",
    image: "monkroyer.png",
    github: "https://github.com/guha-mahesh/monkroyer"
  },
  {
    id: 6,
    title: "Arbor",
    description: "Cultural identity network built around aesthetic houses and shared interests. Profiles are embeddable anywhere, including GitHub READMEs. Has a friend graph and Chrome extension.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Vercel"],
    galaxies: ['culture', 'philosophy'],
    color: "purpleGradient",
    image: "arbor.png",
    github: "https://arbor-blue.vercel.app"
  },
  {
    id: 11,
    title: "ExperienceVec",
    description: "Multi-task model trained to predict how words register in human experience across 89 dimensions: sensorimotor (Lancaster), conceptual (Binder), affective (Warriner VAD), and iconicity (Winter). Input is BERT embeddings + phonological features. The point is a vector space where distance tracks felt similarity, not semantic overlap.",
    tech: ["Python", "PyTorch", "BERT", "HuggingFace", "NumPy"],
    galaxies: ['philosophy'],
    color: "purpleGradient",
    image: "experiencevec.png",
    github: "https://github.com/guha-mahesh/ExperienceVec",
    private: true
  },
  {
    id: 10,
    title: "Meticulous",
    description: "AI agent that controls Ableton Live from natural language. Tell it to make something sound like Magdalena Bay or add more punch to the kick and it does it, via an OSC bridge to Max for Live. Built because nobody wants AI to generate music, they want help producing their own.",
    tech: ["Python", "Claude API", "Max for Live", "OSC", "Ableton Live"],
    galaxies: ['music'],
    color: "orangeGradient",
    image: "meticulous.png",
    github: "https://github.com/guha-mahesh/meticulous",
    private: true
  }
];
