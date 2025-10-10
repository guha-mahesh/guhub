import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PhysicsScene from "./Home";
import Sidebar from "./components/Sidebar";
function App() {


  return (
    <>
    <Sidebar />
    <Router>
      <Routes>


        <Route path ="/" element = {<PhysicsScene/>}/>
      </Routes>



    </Router>
    
    
     
    </>
  )
}

export default App
