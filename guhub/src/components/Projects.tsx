import React, { useState, useRef } from 'react';
import { FaGithub } from 'react-icons/fa';
import './Portfolio.css';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  color: string;
  image: string;
  github: string;
}

interface ProjectCardProps {
  project: Project;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  style?: React.CSSProperties;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isDragging, onDragStart, onDragEnd, style }) => {
  return (
    <div
      className={`projectCard ${isDragging ? 'dragging' : ''} ${project.color}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={style}
    >
      <div className="cardContent">
        <div className="cardInfo">
          <h3 className="cardTitle">{project.title}</h3>

        </div>
        <div className="cardFooter">
          <div className="techTags">
            {project.tech.map((tech, index) => (
              <span key={index} className="techTag">
                {tech}
              </span>
            ))}
          </div>
          <div className="dragText">Drag to select or explore</div>
        </div>
      </div>
    </div>
  );
};

const PortfolioCardDeck: React.FC = () => {
  const initialProjects = [
  {
    id: 1,
    title: "BioClock",
    description: "Built a CNN that predicts biodiversity from satellite images, achieving 80% accuracy using augmented datasets.",
    tech: ["Python", "PyTorch", "Google Earth Engine", "Torchvision"],
    color: "greenGradient",
    image: "BioClock.png",
    github: "https://github.com/guha-mahesh/BioClock"
  },
  {
    id: 2,
    title: "FlightScope",
    description: "Created a web app recommending optimal birdwatching conditions using predictive Poisson models for species sightings.",
    tech: ["Python", "Flask", "React", "Scikit-learn"],
    color: "blueGradient",
    image: "flightscope.png",
    github: "https://github.com/guha-mahesh/FlightScope"
  },
  {
    id: 3,
    title: "Policy Playground",
    description: "Developed regression-based models to forecast financial markets and a policy recommender system for better user engagement.",
    tech: ["Python", "Flask", "MySQL", "Scikit-learn"],
    color: "purpleGradient",
    image: "PolicyPlayground.png",
    github: "https://github.com/guha-mahesh/PolicyPlayground"
  },
  {
    id: 4,
    title: "ClubStop",
    description: "Built a full-stack platform for students to discover, rate, and manage university clubs with secure authentication.",
    tech: ["React", "TypeScript", "MySQL", "Express.js"],
    color: "orangeGradient",
    image: "ClubStop.png",
    github: "https://github.com/guha-mahesh/ClubStop"
  }
];
  const [deckProjects, setDeckProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, project: Project) => {
    setDraggedProject(project);
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnGrid = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedProject) return;

    if (deckProjects.find(p => p.id === draggedProject.id)) {
      if (selectedProject) {
        setDeckProjects(prev => [...prev.filter(p => p.id !== draggedProject.id), selectedProject]);
      } else {
        setDeckProjects(prev => prev.filter(p => p.id !== draggedProject.id));
      }
      setSelectedProject(draggedProject);
    }
  };

  const handleDropOnDeck = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedProject) return;

    if (selectedProject && selectedProject.id === draggedProject.id) {
      setSelectedProject(null);
      setDeckProjects(prev => [draggedProject, ...prev]);
    }
  };

  const removeFromSelected = () => {
    if (selectedProject) {
      setDeckProjects(prev => [...prev, selectedProject]);
      setSelectedProject(null);
    }
  };

  return (
    <div
  className={`portfolioSection ${selectedProject ? "withBackground" : ""}`}
  style={
    selectedProject
      ? { backgroundImage: `url(${selectedProject.image})` }
      : {}
  }
>
      <div className="portfolioContainer">
        <h1 className="portfolioTitle">Portfolio Projects</h1>
        
        <div className="portfolioGrid">
          <div className="deckSection">
            <h2 className="sectionTitle">Project Deck</h2>
            <div 
              className="deckContainer"
              onDragOver={handleDragOver}
              onDrop={handleDropOnDeck}
            >
              {deckProjects.length === 0 ? (
                <p className="emptyText">Drag projects back here</p>
              ) : (
                <div className="cardStack">
                  {deckProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isDragging={draggedProject?.id === project.id}
                      onDragStart={(e) => handleDragStart(e, project)}
                      onDragEnd={handleDragEnd}
                      style={{
                        position: index === 0 ? 'relative' : 'absolute',
                        top: index === 0 ? 0 : -index * 12,
                        left: index === 0 ? 0 : -index * 8,
                        zIndex: deckProjects.length - index,
                        transform: index === 0 ? 'none' : `rotate(${(index % 2 === 0 ? 1 : -1) * index * 3}deg)`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="selectedSection">
            <h2 className="sectionTitle">Selected Project</h2>
            <div 
              ref={gridRef}
              className="selectedContainer"
              onDragOver={handleDragOver}
              onDrop={handleDropOnGrid}
            >
              {!selectedProject ? (
                <p className="emptyText">Drag a project here to select it</p>
              ) : (
                <div className="selectedProjectDetails">
                  <button onClick={removeFromSelected} className="removeButton">
                    ×
                  </button>
                  <h3 className="selectedProjectTitle">{selectedProject.title}</h3>

                  <div className="selectedProjectTech">
                    {selectedProject.tech.map((tech, index) => (
                      <span key={index} className="selectedTechTag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
            


            
          </div>
          
         
        </div>
        
      </div>
       {selectedProject && (<div className= "projectLive">
        
        {selectedProject.description}
        <a href={selectedProject.github ?? "#"} target="_blank" rel="noopener noreferrer"><button  className = "linkButton">{<FaGithub/>}</button></a>



      </div>)}

      
    </div>
  );
};

export default PortfolioCardDeck;