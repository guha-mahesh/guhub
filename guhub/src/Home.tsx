import { useState, useEffect } from 'react'
import PortfolioCardDeck from './components/Projects'

import './Home.css'

import LinkButton from './components/LinkButton'

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

    
    <div className = "projs">
      
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
      
      </div>
    

    </div>

    </>
  )
}

export default Home