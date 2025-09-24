import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PhysicsScene from "./Home";

function App() {


  return (
    <>
    <Router>
      <Routes>


        <Route path ="/" element = {<PhysicsScene/>}/>
      </Routes>



    </Router>
    
    
     
    </>
  )
}

export default App
