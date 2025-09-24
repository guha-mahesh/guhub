

import PortfolioCardDeck from './components/Projects'

import './Home.css'


import LinkButton from './components/LinkButton'

const Home = () => {





  return (
    <>
    <div className = "fullPage">
    <div className = "HomeScreen">

      <div className ="Title">


        <h1> <span className = "flip">G</span><span className = "flip">u</span><span className = "flip">h</span>   <span className = "flip">a</span> <span className="space">&nbsp;</span> <span className = "flip">M</span><span className = "flip">a</span><span className = "flip">h</span><span className = "flip">e</span><span className = "flip">s</span><span className = "flip">h</span></h1>


      </div>


      <div className = "linkButtons">

        <LinkButton icon = "GitHub"/>
        <LinkButton icon = "linkedin"/>
        <LinkButton icon = "download"/>
        <LinkButton icon = "projects"/>
      </div>
    
      
    </div>
    <div className = "projs"><PortfolioCardDeck></PortfolioCardDeck></div>
    

    </div>

    </>
  )
}

export default Home