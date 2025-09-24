
import {FaGithub, FaLinkedin, FaDownload, FaEye} from "react-icons/fa"




interface props{
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
};

const hoverMap: Record<string, string> = {
  "GitHub": "Visit my GithHub",
  "linkedin": "Visit my LinkedIn",
  "download": "Download My Resumé",
  "projects": "View my Projects"

};








  return (
    <>
    
    <a href={linkMap[icon] ?? "#"} target="_blank" rel="noopener noreferrer"><button  className = "linkButton"><h3 className ="tooltip">{hoverMap[icon]}</h3>{iconMap[icon]}</button></a>
    </>
  )
}

export default LinkButton