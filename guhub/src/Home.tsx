import { useState, useEffect } from 'react'
import PortfolioCardDeck from './components/Projects'
import LinkButton from './components/LinkButton'
import './Home.css'

const Home = () => {
  const [cards, setCards] = useState(true)
  const [skill, setSkill] = useState(true)
  const [firstTime,setFirsttime] = useState(true)

  useEffect(()=>{
    setFirsttime(false)
  }, [])

  return (
    <>
    <div className = "fullPage">
    <div className = "HomeScreen">

      <div className ="Title">
        <h1> <span className = "flip">G</span><span className = "flip">u</span><span className = "flip">h</span><span className = "flip">a</span> <span className="space">&nbsp;</span> <span className = "flip">M</span><span className = "flip">a</span><span className = "flip">h</span><span className = "flip">e</span><span className = "flip">s</span><span className = "flip">h</span></h1>
      </div>
      
      <div className =  {`linkButtons ${!skill && ('hidden')}`}>
        <LinkButton icon = "GitHub"/>
        <LinkButton icon = "linkedin"/>
        <LinkButton icon = "download"/>
        {skill && (<span  onClick = {()=>{setSkill(false)}}className= "transitioner">▶</span>)}
      </div>
       <div className =  {`interests ${(skill && !firstTime) && ('hiddenInterests')}`}>
{!skill && (<span  onClick = {()=>{setSkill(true)}}className= "transitioner">◀</span>)}
        <LinkButton icon = "JetPunk"/>
        <LinkButton icon = "MonkeyType"/>
        <LinkButton icon = "music"/>
      </div>

    </div>
          {cards && (<PortfolioCardDeck toggleState={setCards}></PortfolioCardDeck>)}
          {!cards && (
  <div className="simpleProjectsContainer">
    <div className = "titleBox">
      <button className= "linkButton toggleState" onClick = {()=>setCards(true)}>View in Cards</button>
      
    <h1 className="portfolioTitle">Some Stuff I've Been Working On</h1>
    
      </div>
    <div className="simpleProjectsGrid">
      {[
        {
          id: 1,
          title: "BioClock",
          description: "Built a CNN that predicts biodiversity from satellite images, achieving 80% accuracy using augmented datasets.",
          tech: ["Python", "PyTorch", "Google Earth Engine", "Torchvision"],
          github: "https://github.com/guha-mahesh/BioClock"
        },
        {
          id: 2,
          title: "FlightScope",
          description: "Created a web app recommending optimal birdwatching conditions using predictive Poisson models for species sightings.",
          tech: ["Python", "Flask", "React", "Scikit-learn"],
          github: "https://github.com/guha-mahesh/FlightScope"
        },
        {
          id: 3,
          title: "Policy Playground",
          description: "Developed regression-based models to forecast financial markets and a policy recommender system for better user engagement.",
          tech: ["Python", "Flask", "MySQL", "Scikit-learn"],
          github: "https://github.com/guha-mahesh/PolicyPlayground"
        },
        {
          id: 4,
          title: "ClubStop",
          description: "Built a full-stack platform for students to discover, rate, and manage university clubs with secure authentication.",
          tech: ["React", "TypeScript", "MySQL", "Express.js"],
          github: "https://github.com/guha-mahesh/ClubStop"
        }
      ].map((project) => (
        <div key={project.id} className="simpleProjectBox">
          <h3 className="simpleProjectTitle">{project.title}</h3>
          <p className="simpleProjectDescription">{project.description}</p>
          <div className="simpleProjectTech">
            {project.tech.map((tech, index) => (
              <span key={index} className="simpleTechTag">
                {tech}
              </span>
            ))}
          </div>
          <a 
            href={project.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="simpleGithubLink"
          >
            View on GitHub
          </a>
        </div>
      ))}
    </div>
  </div>
)}  
<div className="arborSection">
      <h1 className="sectionHeader">Check out Arbor ~ Work in Progress <img className ="arborIcon" src ="https://arbor-blue.vercel.app/logo.png"/></h1>
      <div className="arborContainer">
        <iframe 
          src="https://arbor-blue.vercel.app/embeds/guha" 
          width="450" 
          height="680" 

            style={{ border: "0px solid #268356" }}



          className="arborFrame"
        />
      </div>
    </div>

    <div className="eduSection">
      <h1 className="sectionHeader">Education</h1>
      <div className="eduBox">
        <div className="eduTop">
          <h2>Northeastern University</h2>
          <span className="eduDate">May 2028</span>
        </div>
        <p className="eduDegree">Bachelor of Science in Data Science and Business Analytics with a focus in FinTech</p>
        <p className="eduGpa">GPA: 3.8/4.0 • John Martinson Honors Program</p>
      </div>
    </div>

    <div className="skillsSection">
      <h1 className="sectionHeader">Technical Skills</h1>
      <div className="skillsGrid">
        <div className="skillCategory">
          <h3 className="categoryTitle">Languages</h3>
          <div className="skillTags">
            {["Python", "TypeScript", "JavaScript", "SQL"].map((skill, i) => (
              <span key={i} className="skillTag">{skill}</span>
            ))}
          </div>
        </div>
        <div className="skillCategory">
          <h3 className="categoryTitle">Tools & Libraries</h3>
          <div className="skillTags">
            {["pandas", "NumPy", "Matplotlib", "Scikit-learn", "Jupyter", "Keras", "Docker", "React", "Flask", "Express.js", "PyTorch", "Torchvision", "AWS S3"].map((skill, i) => (
              <span key={i} className="skillTag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="expSection">
      <h1 className="sectionHeader">Experience</h1>
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
            <li>Produced engaging social media videos that increased visibility and attendance at club information sessions</li>
            <li>Reviewed 30+ membership applications and identified top candidates for interviews</li>
            <li>Led candidate evaluations and interviews, selecting members best positioned to contribute to Rev's mission</li>
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
            <li>Achieved a 5-star rating by guiding 10 students to improve their academic performance and strengthen Python programming</li>
            <li>Delivered personalized instruction in Pandas, NumPy, statistics, and EDA, enabling students to apply data science concepts</li>
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
            <li>Assessed biofuel feasibility of 11 crops by analyzing production volumes, commodity prices, and food security considerations</li>
            <li>Researched crop by-products for potential biofuel applications and presented data-driven recommendations</li>
            <li>Developed visualizations that informed strategic decision-making on the potential establishment of a biorefinery in Texas</li>
          </ul>
        </div>
      </div>
    </div>
    
    

    </div>

    </>
  )
}

export default Home