import { useState, useEffect } from 'react';
import { resumeData as initialResumeData, type ResumeData } from '../data/resumeData';
import './AboutTab.css';

const AboutTab = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  useEffect(() => {
    // Load resume data from localStorage if available (admin edits)
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved resume data');
      }
    }
  }, []);

  return (
    <div className="aboutTab">
      <div className="aboutContainer">
        <div className="aboutHeader">
          <h1 className="aboutTitle">Guha Mahesh</h1>
        </div>

        <div className="eduSection">
          <h2 className="sectionHeader">Education</h2>
          <div className="eduBox">
            <div className="eduTop">
              <h3>{resumeData.education.school}</h3>
              <span className="eduDate">{resumeData.education.date}</span>
            </div>
            <p className="eduDegree">
              {resumeData.education.degree}
            </p>
            <p className="eduGpa">{resumeData.education.gpa}</p>
          </div>
        </div>

        <div className="skillsSection">
          <h2 className="sectionHeader">Technical Skills</h2>
          <div className="skillsGrid">
            <div className="skillCategory">
              <h3 className="categoryTitle">Languages</h3>
              <div className="skillTags">
                {resumeData.skills.languages.map((skill, i) => (
                  <span key={i} className="skillTag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="skillCategory">
              <h3 className="categoryTitle">Tools & Libraries</h3>
              <div className="skillTags">
                {resumeData.skills.tools.map((skill, i) => (
                  <span key={i} className="skillTag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="expSection">
          <h2 className="sectionHeader">Experience</h2>
          <div className="expGrid">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="expBox">
                <div className="expTop">
                  <div>
                    <h3 className="expTitle">{exp.title}</h3>
                    <p className="expCompany">{exp.company}</p>
                  </div>
                  <span className="expDate">{exp.date}</span>
                </div>
                <ul className="expList">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="arborSection">
          <h2 className="sectionHeader arborHeader">
            Check out Arbor <img className="arborIcon" src="https://arbor-blue.vercel.app/logo.png" alt="Arbor logo" />
          </h2>
          <div className="arborContainer">
            <iframe
              src="https://arbor-blue.vercel.app/embeds/guha"
              width="450"
              height="680"
              className="arborFrame"
              title="Arbor Profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
