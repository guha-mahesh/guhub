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
}

export const projects: Project[] = [
  {
    id: 1,
    title: "BioClock",
    description: "Built a CNN that predicts biodiversity from satellite images, achieving 80% accuracy using augmented datasets.",
    tech: ["Python", "PyTorch", "Google Earth Engine", "Torchvision"],
    galaxies: ['geography', 'animals'],
    color: "greenGradient",
    image: "BioClock.png",
    github: "https://github.com/guha-mahesh/BioClock"
  },
  {
    id: 2,
    title: "FlightScope",
    description: "Created a web app recommending optimal birdwatching conditions using predictive Poisson models for species sightings.",
    tech: ["Python", "Flask", "React", "Scikit-learn"],
    galaxies: ['geography', 'animals'],
    color: "blueGradient",
    image: "flightscope.png",
    github: "https://github.com/guha-mahesh/FlightScope"
  },
  {
    id: 3,
    title: "Policy Playground",
    description: "Developed regression-based models to forecast financial markets and a policy recommender system for better user engagement.",
    tech: ["Python", "Flask", "MySQL", "Scikit-learn"],
    galaxies: ['philosophy'],
    color: "purpleGradient",
    image: "PolicyPlayground.png",
    github: "https://github.com/guha-mahesh/PolicyPlayground"
  },
  {
    id: 4,
    title: "ClubStop",
    description: "Built a full-stack platform for students to discover, rate, and manage university clubs with secure authentication.",
    tech: ["React", "TypeScript", "MySQL", "Express.js"],
    galaxies: ['culture'],
    color: "orangeGradient",
    image: "ClubStop.png",
    github: "https://github.com/guha-mahesh/ClubStop"
  }
];
