import { useState, useEffect } from 'react';
import { projects as initialProjects, type Project } from '../data/projects';
import { galaxyArray } from '../data/galaxyData';
import './EditorModal.css';

interface ProjectEditorProps {
  onClose: () => void;
}

const ProjectEditor = ({ onClose }: ProjectEditorProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editData, setEditData] = useState<Partial<Project>>({});

  useEffect(() => {
    // Load from localStorage if exists
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved projects');
      }
    }
  }, []);

  const handleSave = () => {
    if (!selectedProject) return;

    // Check if this is a new project or editing existing
    const existingProject = projects.find(p => p.id === selectedProject.id);

    let updated;
    if (existingProject) {
      // Editing existing project
      updated = projects.map((p) =>
        p.id === selectedProject.id ? { ...p, ...editData } : p
      );
    } else {
      // Adding new project
      updated = [...projects, { ...selectedProject, ...editData } as Project];
    }

    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    setSelectedProject(null);
    setEditData({});
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([`import type { GalaxyType } from './galaxyData';\n\nexport interface Project {\n  id: number;\n  title: string;\n  description: string;\n  tech: string[];\n  galaxies: GalaxyType[];\n  color: string;\n  image: string;\n  github: string;\n}\n\nexport const projects: Project[] = ${dataStr};\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startEdit = (project: Project) => {
    setSelectedProject(project);
    setEditData(project);
  };

  const addNewProject = () => {
    const newProject: Project = {
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      title: '',
      description: '',
      tech: [],
      galaxies: [],
      color: 'pinkGradient',
      image: '',
      github: ''
    };
    setSelectedProject(newProject);
    setEditData(newProject);
  };

  const deleteProject = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
    }
  };

  return (
    <>
      <div className="editorOverlay" onClick={onClose} />
      <div className="editorModal">
        <div className="editorHeader">
          <h2>Edit Projects</h2>
          <button className="editorCloseButton" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="editorContent">
          {!selectedProject ? (
            <>
              <div className="editorActions">
                <button className="addButton" onClick={addNewProject}>
                  + Add New Project
                </button>
                <button className="editorExportButton" onClick={handleExport}>
                  Export Updated File
                </button>
              </div>

              <div className="projectsList">
                {projects.map((project) => (
                  <div key={project.id} className="projectItem">
                    <div className="projectItemInfo">
                      <h3>{project.title}</h3>
                      <p>{project.description.substring(0, 80)}...</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="editButton"
                        onClick={() => startEdit(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="deleteButton"
                        onClick={() => deleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="editForm">
              <div className="formGroup">
                <label>Title</label>
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
              </div>

              <div className="formGroup">
                <label>Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="formGroup">
                <label>Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={editData.tech?.join(', ') || ''}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      tech: e.target.value.split(',').map((t) => t.trim()),
                    })
                  }
                />
              </div>

              <div className="formGroup">
                <label>Galaxies</label>
                <div className="checkboxGroup">
                  {galaxyArray.map((galaxy) => (
                    <label key={galaxy.id} className="checkboxLabel">
                      <input
                        type="checkbox"
                        checked={editData.galaxies?.includes(galaxy.id) || false}
                        onChange={(e) => {
                          const current = editData.galaxies || [];
                          const updated = e.target.checked
                            ? [...current, galaxy.id]
                            : current.filter((g) => g !== galaxy.id);
                          setEditData({ ...editData, galaxies: updated });
                        }}
                      />
                      <span>{galaxy.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="formGroup">
                <label>GitHub URL</label>
                <input
                  type="text"
                  value={editData.github || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, github: e.target.value })
                  }
                />
              </div>

              <div className="formActions">
                <button
                  className="cancelButton"
                  onClick={() => {
                    setSelectedProject(null);
                    setEditData({});
                  }}
                >
                  Cancel
                </button>
                <button className="saveButton" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectEditor;
