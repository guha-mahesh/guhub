import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className={`sidebarToggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '✉'}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebarContent">
          <h2 className="sidebarTitle">
            <span className="flip">G</span>
            <span className="flip">e</span>
            <span className="flip">t</span>
            <span className="space">&nbsp;</span>
            <span className="flip">i</span>
            <span className="flip">n</span>
            <span className="space">&nbsp;</span>
            <span className="flip">T</span>
            <span className="flip">o</span>
            <span className="flip">u</span>
            <span className="flip">c</span>
            <span className="flip">h</span>
          </h2>

          <div className="contactBox">
            <div className="contactItem">
              <span className="contactLabel">Email</span>
              <a href="mailto:guhamaheshv@gmail.com" className="contactLink">
                guhamaheshv@gmail.com
              </a>
            </div>

            <div className="contactItem">
              <span className="contactLabel">Phone</span>
              <a href="tel:346-368-4903" className="contactLink">
                346•368•4903
              </a>
            </div>

            <div className="contactItem">
              <span className="contactLabel">Location</span>
              <span className="contactText">Boston, MA</span>
            </div>

           
          </div>
        </div>
      </div>

      {isOpen && <div className="sidebarOverlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;