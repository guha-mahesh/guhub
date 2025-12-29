import { useState, useEffect } from 'react';
import { resumeData as initialResumeData, type ResumeData } from '../data/resumeData';
import './EditorModal.css';

interface ResumeEditorProps {
  onClose: () => void;
}

const ResumeEditor = ({ onClose }: ResumeEditorProps) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  useEffect(() => {
    // Load from localStorage if exists
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved resume data');
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    alert('Resume data saved! Changes will be reflected on the page.');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const fileContent = `export interface Education {
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

export const resumeData: ResumeData = ${dataStr};
`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resumeData.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateEducation = (field: keyof typeof resumeData.education, value: string) => {
    setResumeData({
      ...resumeData,
      education: { ...resumeData.education, [field]: value }
    });
  };

  const updateSkills = (category: 'languages' | 'tools', value: string) => {
    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        [category]: value.split(',').map(s => s.trim()).filter(s => s)
      }
    });
  };

  const updateExperience = (index: number, field: keyof typeof resumeData.experience[0], value: any) => {
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { title: '', company: '', date: '', bullets: [''] }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const updated = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: updated });
  };

  return (
    <>
      <div className="editorOverlay" onClick={onClose} />
      <div className="editorModal editorModalLarge">
        <div className="editorHeader">
          <h2>Edit Resume</h2>
          <button className="editorCloseButton" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="editorContent">
          <div className="editorActions">
            <button className="editorSaveButton" onClick={handleSave}>
              Save Changes
            </button>
            <button className="editorExportButton" onClick={handleExport}>
              Export Updated File
            </button>
          </div>

          <div className="editForm">
            <h3 className="formSectionTitle">Education</h3>
            <div className="formGroup">
              <label>School</label>
              <input
                type="text"
                value={resumeData.education.school}
                onChange={(e) => updateEducation('school', e.target.value)}
              />
            </div>
            <div className="formGroup">
              <label>Degree</label>
              <input
                type="text"
                value={resumeData.education.degree}
                onChange={(e) => updateEducation('degree', e.target.value)}
              />
            </div>
            <div className="formGroup">
              <label>GPA & Honors</label>
              <input
                type="text"
                value={resumeData.education.gpa}
                onChange={(e) => updateEducation('gpa', e.target.value)}
              />
            </div>
            <div className="formGroup">
              <label>Graduation Date</label>
              <input
                type="text"
                value={resumeData.education.date}
                onChange={(e) => updateEducation('date', e.target.value)}
              />
            </div>

            <h3 className="formSectionTitle">Skills</h3>
            <div className="formGroup">
              <label>Languages (comma-separated)</label>
              <input
                type="text"
                value={resumeData.skills.languages.join(', ')}
                onChange={(e) => updateSkills('languages', e.target.value)}
              />
            </div>
            <div className="formGroup">
              <label>Tools & Libraries (comma-separated)</label>
              <input
                type="text"
                value={resumeData.skills.tools.join(', ')}
                onChange={(e) => updateSkills('tools', e.target.value)}
              />
            </div>

            <h3 className="formSectionTitle">Experience</h3>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="experienceEditor">
                <div className="experienceHeader">
                  <h4>Position {index + 1}</h4>
                  <button
                    className="removeButton"
                    onClick={() => removeExperience(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="formGroup">
                  <label>Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <label>Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <label>Date Range</label>
                  <input
                    type="text"
                    value={exp.date}
                    onChange={(e) => updateExperience(index, 'date', e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <label>Bullets (one per line)</label>
                  <textarea
                    value={exp.bullets.join('\n')}
                    onChange={(e) =>
                      updateExperience(
                        index,
                        'bullets',
                        e.target.value.split('\n').filter(b => b.trim())
                      )
                    }
                    rows={5}
                  />
                </div>
              </div>
            ))}
            <button className="addButton" onClick={addExperience}>
              + Add Experience
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeEditor;
