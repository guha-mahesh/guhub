import { FaGithub, FaLinkedin, FaInstagram, FaDownload, FaEnvelope, FaPhone} from 'react-icons/fa'
import { useState, useEffect } from 'react';
import jellyfish from '../assets/jellyfish.png';
import clownfish from '../assets/clownfish.png';
import bubble from '../assets/bubbles.png';
import Project from '../components/Project';
import ribbon from '../assets/background2.png'
import Archive from './Table';




const Home = () => {


  const [isDesktop, setIsDesktop] = useState(true)

  
  const [scrolled,setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false);  
 
 
 useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };


    checkIsDesktop();
    


    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);
useEffect(() => {
  setIsMenuOpen(isDesktop);
}, [isDesktop]);


   useEffect(() => {
    const handleScroll = () => {
      
      if (window.scrollY >= 920) {
        setScrolled(true)
        document.body.classList.add("scrolled");
      } else {
        setScrolled(false)
        document.body.classList.remove("scrolled");
      }
      
    }; 

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>





         
      
        <div className="animate__animated animate__fadeInDown animate__slow title">
  <p className = "name">Guha Mahesh</p>
  <h3 className = "quote">
        Someone smarter than you disagrees with you,<br></br> so don't carry your opinions as stone walls.
      </h3>
  <div className = "contact-info">
      <h5>
  <a href="tel:3463684903" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>
    <FaPhone style={{ marginRight: '0.5rem' }} /> 346-368-4903
  </a>
  <a href="mailto:guhamaheshv@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }}>
    <br className = "envelopeBr"></br>
    <FaEnvelope style={{ marginRight: '0.5rem' }} /> guhamaheshv@gmail.com
  </a>
</h5>

</div>
</div>
<img src={jellyfish} alt="Jellyfish" className={!scrolled?"jellyfish aero": "hiddenImg"} />
<img src={clownfish} alt="Clownfish" className={!scrolled?"clownfish aero":"hiddenImg"} />
<img src={bubble} alt="Bubble" className={!scrolled?"bubble aero":"hiddenImg"} />
<img src={ribbon} alt="ribbon" className={!scrolled?"hiddenImg":"ribbon aero"} />







      


      <div className = {isMenuOpen? "funky-links": "funky-links hidden"}>
        <button onClick = {()=>setIsMenuOpen(!isMenuOpen)}className="hamburger" >
  <span></span>
  <span></span>
  <span></span>
</button>

          
        

        <a
          href="https://github.com/guha-mahesh"
          target="_blank"
          rel="noopener noreferrer"
          className = {!scrolled? "IconLink":"iconLinkScroll"}

        >
          <FaGithub size={20} />
          <span className = "linkLabel">GitHub</span>
        </a>


        <a
          href="https://www.linkedin.com/in/guhamahesh/"
          target="_blank"
          rel="noopener noreferrer"
          className = {!scrolled? "IconLink":"iconLinkScroll"}

        >
          <FaLinkedin size={20} />
          <span className = "linkLabel">LinkedIn</span>
        </a>


        


      


        <a
          href="/assets/GuhaResumé.pdf"
          download
          className = {!scrolled? "IconLink":"iconLinkScroll"}

        >
          <FaDownload size={20} />
          <span className = "linkLabel">Download Resumé</span>
        </a>
        <a
          href="https://www.instagram.com/guha._/"
          target="_blank"
          rel="noopener noreferrer"
          className = {!scrolled? "IconLink":"iconLinkScroll"}

        >
          <FaInstagram size={20} />
          <span className = "linkLabel">Instagram</span>
        </a>
      </div>
  <br/><br/><br/><br/>
 
  
    

  <div className = {!scrolled?"AboutMeNS":"AboutMe"}>
    <h1 className = {!scrolled?"Aboutme":"aboutMe"}>About Me</h1>
    <div>
    <p className ={scrolled? "about" : "notAbout"}>
    I'm a second year Honors Data Science and Fintech student at Northeasten University. While my area of study revolves mostly around developing machine learning models, I also love creating fullstack web-apps. Outside of the tech-sphere, I have a large interest in geography, philosophy, monkeytype, running, and animals.
    </p>
    <div className = "linkFlex">
      <a href='https://www.jetpunk.com/users/whynotlmao'><div className ={scrolled? "recLink":"noRecLink"}>Jetpunk</div></a>
      <a href = "https://monkeytype.com/profile/guavsy"><div className ={scrolled? "recLink":"noRecLink"}>Monkeytype</div></a>
      <a href="https://tx.milesplit.com/athletes/11057457-guha-mahesh"><div className ={scrolled? "recLink":"noRecLink"}>MileSplit</div></a>
      {/*<a><div>CheckThisOut(WIP)</div></a>*/}
    </div>
    </div>
  </div>
  
  <div className = "project-flex">
    <Project image = "/logo.png"title = "Policy Playground" bps = {["Developed a financial forecasting pipeline that predicts S&P 500 and five major currency exchange rates using normalized fiscal and monetary policy instruments and lagged historical data",
"Created the MVP as an interactive site for those interested in legislation to ideate and swap policy ideas",
"Attended guest speaker events at European institutions across Belgium to learn about policymakers and align the platform with real-world policy needs"]}  link="https://github.com/guha-mahesh/PolicyPlayground"/>
  <Project image = "/puffin.png"title = "ClubStop" bps = {["Developed a full-stack application for University Students to find, rate and promote clubs and organizations",
"Utilized Docker to containerize a full-stack application with MySQL, React (frontend), and Node.js (TypeScript) backend services",
"Designed and implemented an API blueprint with 20 RESTful routes to support authentication, club management, and user interactions"
]}  link="https://github.com/guha-mahesh/ClubStop"/>
  <Project image = "/monkroyer.png"title = "Monkroyer" bps = {["Developing a web app that gamifies real-world predictions by rewarding users through an interactive Monkey Avatar",
"Utilized the Ollama LLM to evaluate plausibilities for the user-submitted 'Bingo' predictions",
"Containerized with an Express/Node.js (backend), React (frontend), and MySQL",
"Leveraged AWS S3 to store user-submitted image evidence validating completed predictions"

]}  link="https://github.com/guha-mahesh/Monkroyer"/>
</div>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<Archive></Archive>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    
  
    </>
  )
}

export default Home
