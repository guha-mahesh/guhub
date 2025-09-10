import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Instagram, Download, Mail, Phone, ExternalLink, Code, Database, Globe } from 'lucide-react';
import '../App.css';

interface MousePosition {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface Project {
  title: string;
  description: string;
  tech: string[];
  gradient: string;
  link: string;
}

interface SocialLink {
  icon: React.ElementType;
  href: string;
  label: string;
}

interface Skill {
  icon: React.ElementType;
  name: string;
  level: number;
}

const Portfolio: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = (): void => {
      const sections = ['hero', 'about', 'projects'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${particle.opacity})`;
        ctx.fill();
      });

      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(0, 245, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projects: Project[] = [
    {
      title: "Policy Playground",
      description: "Financial forecasting pipeline predicting S&P 500 and currency exchange rates using normalized fiscal and monetary policy instruments.",
      tech: ["Machine Learning", "React", "Financial Analysis"],
      gradient: "from-purple-500 to-pink-500",
      link: "https://github.com/guha-mahesh/PolicyPlayground"
    },
    {
      title: "ClubStop",
      description: "Full-stack application for University Students to find, rate and promote clubs and organizations with Docker containerization.",
      tech: ["React", "Node.js", "MySQL", "Docker"],
      gradient: "from-blue-500 to-cyan-500",
      link: "https://github.com/guha-mahesh/ClubStop"
    },
    {
      title: "Monkroyer",
      description: "Gamified real-world predictions app with interactive Monkey Avatar, utilizing Ollama LLM and AWS S3 for image storage.",
      tech: ["React", "Express.js", "MySQL", "AWS S3", "Ollama LLM"],
      gradient: "from-green-500 to-teal-500",
      link: "https://github.com/guha-mahesh/Monkroyer"
    }
  ];

  const socialLinks: SocialLink[] = [
    { icon: Github, href: "https://github.com/guha-mahesh", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/guhamahesh/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/guha._/", label: "Instagram" }
  ];

  const skills: Skill[] = [
    { icon: Code, name: "Full-Stack Development", level: 90 },
    { icon: Database, name: "Machine Learning", level: 85 },
    { icon: Globe, name: "Data Science", level: 88 }
  ];

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="portfolio-container">
      <canvas ref={canvasRef} className="particle-canvas" />
      
      <div 
        className="cursor-glow"
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
        }}
      />

      <nav className="floating-nav">
        {['hero', 'about', 'projects'].map((section) => (
          <div
            key={section}
            className={`nav-dot ${activeSection === section ? 'active' : ''}`}
            onClick={() => scrollToSection(section)}
          />
        ))}
      </nav>

      <section id="hero" className="hero-section" ref={heroRef}>
        <div className={`fade-in ${isLoaded ? 'stagger-1' : ''}`}>
          <h1 className="glitch-text">Guha Mahesh</h1>
        </div>
        <div className={`fade-in ${isLoaded ? 'stagger-2' : ''}`}>
          <p className="hero-subtitle">Data Science & Fintech Student</p>
        </div>
        <div className={`fade-in ${isLoaded ? 'stagger-3' : ''}`}>
          <p className="quote">
            "Someone smarter than you disagrees with you,<br />
            so don't carry your opinions as stone walls."
          </p>
        </div>
        
        <div className={`contact-info fade-in ${isLoaded ? 'stagger-4' : ''}`}>
          <a href="tel:3463684903" className="contact-item">
            <Phone size={18} />
            <span>346-368-4903</span>
          </a>
          <a href="mailto:guhamaheshv@gmail.com" className="contact-item">
            <Mail size={18} />
            <span>guhamaheshv@gmail.com</span>
          </a>
        </div>

        <div className={`social-links fade-in ${isLoaded ? 'stagger-5' : ''}`}>
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title={social.label}
              >
                <IconComponent size={24} />
              </a>
            );
          })}
        </div>

        <div className={`fade-in ${isLoaded ? 'stagger-5' : ''}`}>
          <a href="/GuhaMaheshResume.pdf" download className="download-btn">
            <Download size={18} />
            Download Resume
          </a>
        </div>
      </section>

      <section id="about" className="section">
        <h2 className="section-title">About Me</h2>
        
        <div className="about-content">
          <p className="about-text">
            I'm a second year Honors Data Science and Fintech student at Northeastern University. 
            While my area of study revolves mostly around developing machine learning models, 
            I also love creating fullstack web-apps. Outside of the tech-sphere, I have a large 
            interest in geography, philosophy, monkeytype, running, and animals.
          </p>
        </div>

        <div className="skills-grid">
          {skills.map((skill, index) => {
            const IconComponent = skill.icon;
            return (
              <div key={index} className="skill-card">
                <IconComponent size={48} className="skill-icon" />
                <h3 className="skill-name">{skill.name}</h3>
                <div className="skill-bar">
                  <div 
                    className="skill-progress"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="links-grid">
          <a 
            href="https://www.jetpunk.com/users/whynotlmao" 
            className="link-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jetpunk Profile
          </a>
          <a 
            href="https://monkeytype.com/profile/guavsy" 
            className="link-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            Monkeytype
          </a>
          <a 
            href="https://tx.milesplit.com/athletes/11057457-guha-mahesh" 
            className="link-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            MileSplit
          </a>
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="section-title">Projects</h2>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              
              <div className="tech-stack">
                {project.tech.map((tech, techIndex) => (
                  <span key={techIndex} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                View Project <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;