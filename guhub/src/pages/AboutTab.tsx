import { useState, useEffect } from 'react';
import { resumeData as initialResumeData, type ResumeData } from '../data/resumeData';
import './AboutTab.css';

const AboutTab = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  useEffect(() => {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try { setResumeData(JSON.parse(saved)); } catch {}
    }
  }, []);

  const allSkills = [...resumeData.skills.languages, ...resumeData.skills.tools];

  return (
    <div className="aboutTab">
      <div className="aboutContainer">

        {/* ── header ── */}
        <header className="resumeHeader">
          <div className="resumeNameBlock">
            <h1 className="resumeName">Guha Mahesh</h1>
            <span className="resumeTagline">Data Science &amp; Engineering</span>
          </div>
          <div className="resumeHeaderMeta">
            <a href="https://github.com/guha-mahesh" target="_blank" rel="noopener noreferrer" className="resumeMetaLink">github</a>
            <span className="resumeMetaDot" />
            <a href="https://linkedin.com/in/guha-mahesh" target="_blank" rel="noopener noreferrer" className="resumeMetaLink">linkedin</a>
            <span className="resumeMetaDot" />
            <a href="/GuhaMaheshResumé.pdf" download className="resumeMetaLink resumeDownload">download pdf</a>
          </div>
        </header>

        <div className="resumeRule" />

        {/* ── body: two columns ── */}
        <div className="resumeBody">

          {/* ── left col ── */}
          <aside className="resumeLeft">

            <section className="resumeLeftSection">
              <p className="leftLabel">education</p>
              <p className="leftSchool">{resumeData.education.school}</p>
              <p className="leftDegreeText">{resumeData.education.degree}</p>
              <p className="leftMeta">{resumeData.education.gpa}</p>
              <p className="leftMeta">exp. {resumeData.education.date}</p>
            </section>

            <div className="leftRule" />

            <section className="resumeLeftSection">
              <p className="leftLabel">skills</p>
              <p className="skillsInline">{allSkills.join(', ')}</p>
            </section>

            <div className="leftRule" />

            <section className="resumeLeftSection">
              <p className="leftLabel">interests</p>
              <p className="skillsInline">shoegaze, competitive typing, metaethics, effective altruism, animal welfare, geopolitics</p>
            </section>

          </aside>

          {/* ── right col: experience ── */}
          <main className="resumeRight">
            <p className="rightLabel">experience</p>

            {resumeData.experience.map((exp, i) => {
              const isLast = i === resumeData.experience.length - 1;
              // last bullet is context line, style it differently
              const contextBullet = exp.bullets[exp.bullets.length - 1];
              const mainBullets = exp.bullets.slice(0, -1);
              const hasContext = exp.company === 'Engramme (fka. Memory Machines)';

              return (
                <div key={i} className="expEntry">
                  <div className="expEntryHeader">
                    <div className="expEntryLeft">
                      <span className="expEntryCompany">{exp.company}</span>
                      <span className="expEntryTitle">{exp.title}</span>
                    </div>
                    <span className="expEntryDate">{exp.date}</span>
                  </div>
                  <ul className="expEntryBullets">
                    {(hasContext ? mainBullets : exp.bullets).map((bullet, j) => (
                      <li key={j} className="expBullet">{bullet}</li>
                    ))}
                  </ul>
                  {hasContext && (
                    <p className="expContext">{contextBullet}</p>
                  )}
                  {!isLast && <div className="expRule" />}
                </div>
              );
            })}
          </main>
        </div>



      </div>
    </div>
  );
};

export default AboutTab;
