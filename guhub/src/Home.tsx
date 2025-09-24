

import PortfolioCardDeck from './components/Projects'

import './Home.css'


import LinkButton from './components/LinkButton'

const Home = () => {





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
    <div className = "projs"><PortfolioCardDeck></PortfolioCardDeck></div>
    

    </div>

    </>
  )
}

export default Home