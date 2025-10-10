import {FaGithub, FaLinkedin, FaDownload, FaEye} from "react-icons/fa"
import jetpunk from '../assets/jetpunk.svg'
import monkeytype from '../assets/monkeytype.svg'
import music from '../assets/music.svg'



interface props {
  icon: string;
}

const LinkButton = ({icon}: props) => {
  const iconMap: Record<string, React.ReactNode> = {
    "GitHub": <FaGithub />,
    "linkedin": <FaLinkedin />,
    "download": <FaDownload />,
    "projects": <FaEye/>,
    "JetPunk": <img src={jetpunk} alt="JetPunk" style={{width: '1em', height: '1em'}} />,
    "MonkeyType": <img src={monkeytype} alt="MonkeyType" style={{width: '1em', height: '1em'}} />,
    "music": <img src={music} alt="music" style={{width: '1em', height: '1em'}} />,




  };

  const linkMap: Record<string, string> = {
    "GitHub": "https://github.com/guha-mahesh",
    "linkedin": "https://linkedin.com/in/guhamahesh",
    "download": "/GuhaMaheshResumé.pdf",
    "JetPunk": "https://www.jetpunk.com/your-account",
    "MonkeyType": "https://monkeytype.com/profile/guavsy",
    "music": "https://bashify.io/i/julBA9#"


  };

  const hoverMap: Record<string, string> = {
    "GitHub": "Visit my GitHub",
    "linkedin": "Visit my LinkedIn",
    "download": "Download My Resumé",
    "projects": "View my Projects",
    "JetPunk": "Can name Capitals/Flags/Currencies/Shapes for all 196 Countries",
    "MonkeyType": "146 wpm 15 seconds",
    "music": "Check out my top 25 albums"
  };

  const handleClick = (e: React.MouseEvent) => {
    if (icon === "download") {
      e.preventDefault();
      
      const link = document.createElement('a');
      link.href = '/GuhaMaheshResumé.pdf';
      link.download = 'GuhaMaheshResumé.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <a 
        href={linkMap[icon] ?? "#"} 
        target={icon === "download" ? "_self" : "_blank"} 
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        <button className="linkButton">
          <h3 className="tooltip">{hoverMap[icon]}</h3>
          {iconMap[icon]}
        </button>
      </a>
    </>
  )
}

export default LinkButton