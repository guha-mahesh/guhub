import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`sidebarToggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="contact.exe"
      >
        <span className="toggleIcon">{isOpen ? '[ x ]' : '[ ! ]'}</span>
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebarContent">
          <div className="terminalHeader">
            <span className="terminalDot red"></span>
            <span className="terminalDot yellow"></span>
            <span className="terminalDot green"></span>
            <span className="terminalTitle">contact.exe</span>
          </div>

          <div className="terminalBody">
            <div className="terminalLine">
              <span className="terminalPrompt">$</span>
              <span className="terminalCommand">cat contact_info.txt</span>
            </div>

            <div className="contactData">
              <div className="dataLine">
                <span className="dataKey">email:</span>
                <a href="mailto:guhamaheshv@gmail.com" className="dataValue link">
                  guhamaheshv@gmail.com
                </a>
              </div>

              <div className="dataLine">
                <span className="dataKey">phone:</span>
                <a href="tel:346-368-4903" className="dataValue link">
                  +1 (346) 368-4903
                </a>
              </div>

              <div className="dataLine">
                <span className="dataKey">location:</span>
                <span className="dataValue">Boston, MA</span>
              </div>

              <div className="dataLine">
                <span className="dataKey">status:</span>
                <span className="dataValue blink">● online</span>
              </div>
            </div>

            <div className="terminalLine">
              <span className="terminalPrompt">$</span>
              <span className="terminalCommand">echo "let's connect!"</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="sidebarOverlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;