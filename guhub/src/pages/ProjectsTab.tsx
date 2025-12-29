import { useState, useEffect } from 'react';
import { projects as initialProjects } from '../data/projects';
import type { Project } from '../data/projects';
import { galaxyArray, type GalaxyType } from '../data/galaxyData';
import GalaxyBadge from '../components/GalaxyBadge';
import { FaGithub } from 'react-icons/fa';
import './ProjectsTab.css';

const ProjectsTab = () => {
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyType | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    // Load projects from localStorage if available (admin edits)
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved projects');
      }
    }
  }, []);

  const filteredProjects = selectedGalaxy
    ? projects.filter(p => p.galaxies.includes(selectedGalaxy))
    : projects;

  const handleGalaxyClick = (galaxy: GalaxyType) => {
    setSelectedGalaxy(selectedGalaxy === galaxy ? null : galaxy);
  };

  return (
    <div className="projectsTab">
      <div className="projectsContainer">
        <h1 className="projectsPageTitle">Projects</h1>

        <div className="galaxyFilters">
          <span className="filterLabel">Filter by Gu-laxy:</span>
          <div className="filterBadges">
            {galaxyArray.map(galaxy => (
              <GalaxyBadge
                key={galaxy.id}
                galaxyId={galaxy.id}
                onClick={() => handleGalaxyClick(galaxy.id)}
                active={selectedGalaxy === galaxy.id}
              />
            ))}
          </div>
        </div>

        <div className="projectsGrid">
          {filteredProjects.map(project => (
            <div key={project.id} className="projectBox">
              <h2 className="projectTitle">{project.title}</h2>
              <p className="projectDescription">{project.description}</p>

              <div className="projectGalaxies">
                {project.galaxies.map(galaxyId => (
                  <GalaxyBadge key={galaxyId} galaxyId={galaxyId} />
                ))}
              </div>

              <div className="projectTech">
                {project.tech.map((tech, index) => (
                  <span key={index} className="techTag">
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="githubLinkButton"
              >
                <FaGithub /> View on GitHub
              </a>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="noProjects">No projects found for this galaxy.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;
