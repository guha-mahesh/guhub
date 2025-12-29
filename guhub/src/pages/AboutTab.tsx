import { FaDownload } from 'react-icons/fa';
import './AboutTab.css';

const AboutTab = () => {
  const handleResumeDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = '/GuhaMaheshResumé.pdf';
    link.download = 'GuhaMaheshResumé.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="aboutTab">
      <div className="aboutContainer">
        <div className="aboutHeader">
          <h1 className="aboutTitle">Guha Mahesh</h1>
          <button onClick={handleResumeDownload} className="resumeButton">
            <FaDownload /> Download Resume
          </button>
        </div>

        <div className="eduSection">
          <h2 className="sectionHeader">Education</h2>
          <div className="eduBox">
            <div className="eduTop">
              <h3>Northeastern University</h3>
              <span className="eduDate">May 2028</span>
            </div>
            <p className="eduDegree">
              Bachelor of Science in Data Science and Business Analytics with a focus in FinTech
            </p>
            <p className="eduGpa">GPA: 3.8/4.0 • John Martinson Honors Program</p>
          </div>
        </div>

        <div className="skillsSection">
          <h2 className="sectionHeader">Technical Skills</h2>
          <div className="skillsGrid">
            <div className="skillCategory">
              <h3 className="categoryTitle">Languages</h3>
              <div className="skillTags">
                {["Python", "TypeScript", "JavaScript", "SQL"].map((skill, i) => (
                  <span key={i} className="skillTag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="skillCategory">
              <h3 className="categoryTitle">Tools & Libraries</h3>
              <div className="skillTags">
                {[
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
                ].map((skill, i) => (
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
            <div className="expBox">
              <div className="expTop">
                <div>
                  <h3 className="expTitle">Facilitator</h3>
                  <p className="expCompany">Rev (NU Student Club)</p>
                </div>
                <span className="expDate">Aug 2025 – Present</span>
              </div>
              <ul className="expList">
                <li>
                  Produced engaging social media videos that increased visibility and attendance at club
                  information sessions
                </li>
                <li>Reviewed 30+ membership applications and identified top candidates for interviews</li>
                <li>
                  Led candidate evaluations and interviews, selecting members best positioned to contribute
                  to Rev's mission
                </li>
              </ul>
            </div>

            <div className="expBox">
              <div className="expTop">
                <div>
                  <h3 className="expTitle">Data Science Tutor</h3>
                  <p className="expCompany">Knack</p>
                </div>
                <span className="expDate">Jan 2025 – Present</span>
              </div>
              <ul className="expList">
                <li>
                  Achieved a 5-star rating by guiding 10 students to improve their academic performance and
                  strengthen Python programming
                </li>
                <li>
                  Delivered personalized instruction in Pandas, NumPy, statistics, and EDA, enabling students
                  to apply data science concepts
                </li>
              </ul>
            </div>

            <div className="expBox">
              <div className="expTop">
                <div>
                  <h3 className="expTitle">Data Science Intern</h3>
                  <p className="expCompany">Green Joules</p>
                </div>
                <span className="expDate">Jun 2023 – Sep 2023</span>
              </div>
              <ul className="expList">
                <li>
                  Assessed biofuel feasibility of 11 crops by analyzing production volumes, commodity prices,
                  and food security considerations
                </li>
                <li>
                  Researched crop by-products for potential biofuel applications and presented data-driven
                  recommendations
                </li>
                <li>
                  Developed visualizations that informed strategic decision-making on the potential
                  establishment of a biorefinery in Texas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
