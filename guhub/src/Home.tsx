
import { useState } from 'react'
import PortfolioCardDeck from './components/Projects'

import './Home.css'


import LinkButton from './components/LinkButton'

const Home = () => {
  const [cards, setCards] = useState(true)





  return (
    <>
    <div className = "fullPage">
    <div className = "HomeScreen">

      <div className ="Title">


        <h1> <span className = "flip">G</span><span className = "flip">u</span><span className = "flip">h</span><span className = "flip">a</span> <span className="space">&nbsp;</span> <span className = "flip">M</span><span className = "flip">a</span><span className = "flip">h</span><span className = "flip">e</span><span className = "flip">s</span><span className = "flip">h</span></h1>
        <div className = "contactInfo"><h2>346•368•4903</h2> <h2>guhamaheshv@gmail.com</h2></div>


      </div>
      


      <div className = "linkButtons">

        <LinkButton icon = "GitHub"/>
        <LinkButton icon = "linkedin"/>
        <LinkButton icon = "download"/>

      </div>

      
    
      
    </div>
    <div className = "transition-strip"></div>
     <div className="projectsHeader">
    <h2 className="projectsHeaderTitle">Projects</h2>
    <button 
      className="linkButton viewToggle" 
      onClick={() => setCards(!cards)}
    >
      {cards ? 'Simple View' : 'Interactive View'}
    </button>
  </div>
    <div className = "projs">
      
      {cards && (<PortfolioCardDeck></PortfolioCardDeck>)}

      {!cards && (
  <div className="simpleProjectsContainer">
    <div className = "titleBox">
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
      
      </div>
    

    </div>

    </>
  )
}

export default Home