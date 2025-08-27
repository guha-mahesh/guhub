
import './Table.css'


const Table = () => {
  return (
    <>
    <div className = "table1" >
        <div className = "navHeader">
          <h1>Languages</h1>
          <div className = "listCont">
             <ul>
        <li>Python</li>
        <li>Javascript</li>
        <li>Typescript</li>
        <li>SQL</li>



      </ul>
          </div>
        </div>
        <div className = "navHeader">
          <h1>Libraries</h1>
          <div className = "listCont">
             <ul>
        <li>React</li>
        <li>Pandas</li>
        <li>Axios</li>
        <li>scikit-learn</li>
        <li>numpy</li>
        <li>plotly</li>
        <li>matplotlib</li>
        <li>Flask</li>



      </ul>
          </div>
        </div>
       <div className = "navHeader">
          <h1>Tools</h1>
          <div className = "listCont">
             <ul>
        <li>GitHub</li>
        <li>Docker</li>
        <li>VSCode</li>
        <li>Node.js</li>
        <li>MySQL</li>



      </ul>
          </div>
        </div>


    </div>
    
    </>
  )
}

export default Table