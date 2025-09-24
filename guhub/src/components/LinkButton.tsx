import {FaGithub, FaLinkedin, FaDownload, FaEye} from "react-icons/fa"

interface props {
  icon: string;
}

const LinkButton = ({icon}: props) => {
  const iconMap: Record<string, React.ReactNode> = {
    "GitHub": <FaGithub />,
    "linkedin": <FaLinkedin />,
    "download": <FaDownload />,
    "projects": <FaEye/>
  };

  const linkMap: Record<string, string> = {
    "GitHub": "https://github.com/guha-mahesh",
    "linkedin": "https://linkedin.com/in/guhamahesh",
    "download": "/GuhaMaheshResumé.pdf" 
  };

  const hoverMap: Record<string, string> = {
    "GitHub": "Visit my GitHub",
    "linkedin": "Visit my LinkedIn",
    "download": "Download My Resumé",
    "projects": "View my Projects"
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