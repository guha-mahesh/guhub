interface Props {
  title: string;
  bps: string[];
  link?: string;       
  image?: string; 

}

const Project = ({ title, bps, link, image,  }: Props) => {
  const CardContent = (
    <div className="project-card">
      <h1 className="projTitle">{title}</h1>
      {image && <img className = "projImage"src={image} alt={title} />}
      <ul className="bp">
        {bps.map((bp, index) => (
          <li className = "bullet"key={index}>{bp}</li>
        ))}
      </ul>
    </div>
  );


  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="project-link">
      {CardContent}
    </a>
  ) : (
    CardContent
  );
};

export default Project;
