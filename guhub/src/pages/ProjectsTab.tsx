import { useState, useRef, useEffect } from 'react';
import { projects as allProjects } from '../data/projects';
import type { Project } from '../data/projects';
import { galaxyArray, type GalaxyType } from '../data/galaxyData';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import MemorySpan from '../components/MemorySpan';
import './ProjectsTab.css';

const W = 900;
const H = 560;
const CX = W / 2;

// trunk: slight organic drift left as it rises
const trunkPath = `M ${CX} ${H} C ${CX-2} ${H-120} ${CX-4} ${H-240} ${CX-6} ${H-360}`;

// node positions — left column, right column, top
const NODE_POS = [
  { x: 125, y: 115, ax: CX-4, ay: 200 },   // 0  far-left high
  { x: 78,  y: 275, ax: CX-5, ay: 300 },   // 1  far-left mid
  { x: 175, y: 385, ax: CX-5, ay: 360 },   // 2  left mid-low
  { x: 255, y: 468, ax: CX-4, ay: 430 },   // 3  left low
  { x: 775, y: 115, ax: CX-4, ay: 200 },   // 4  far-right high
  { x: 822, y: 275, ax: CX-3, ay: 300 },   // 5  far-right mid
  { x: 725, y: 385, ax: CX-3, ay: 360 },   // 6  right mid-low
  { x: 645, y: 468, ax: CX-4, ay: 430 },   // 7  right low
  { x: CX,  y: 44,  ax: CX-6, ay: 200 },   // 8  crown
  { x: 310, y: 220, ax: CX-5, ay: 280 },   // 9  center-left
  { x: 590, y: 220, ax: CX-3, ay: 280 },   // 10 center-right
  { x: 450, y: 480, ax: CX-4, ay: 500 },   // 11 base
];

function branchPath(ax: number, ay: number, px: number, py: number): string {
  const dx = px - ax;
  if (px < CX - 20) {
    return `M ${ax} ${ay} C ${ax + dx * 0.55} ${ay} ${px + Math.abs(dx) * 0.25} ${py + 55} ${px} ${py}`;
  } else if (px > CX + 20) {
    return `M ${ax} ${ay} C ${ax + dx * 0.55} ${ay} ${px - Math.abs(dx) * 0.25} ${py + 55} ${px} ${py}`;
  } else {
    return `M ${ax} ${ay} C ${ax} ${ay - 90} ${px} ${py + 90} ${px} ${py}`;
  }
}

export default function ProjectsTab() {
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyType | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [projects] = useState<Project[]>(allProjects);
  const svgRef = useRef<SVGSVGElement>(null);
  const trunkRef = useRef<SVGPathElement>(null);
  const branchRefs = useRef<(SVGPathElement | null)[]>([]);

  const filtered = selectedGalaxy
    ? projects.filter(p => p.galaxies.includes(selectedGalaxy))
    : projects;

  const filteredSet = new Set(filtered.map(p => p.id));

  // animate on mount
  useEffect(() => {
    if (!trunkRef.current) return;
    const tLen = trunkRef.current.getTotalLength();
    trunkRef.current.style.strokeDasharray = `${tLen}`;
    trunkRef.current.style.strokeDashoffset = `${tLen}`;
    trunkRef.current.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) 0.1s';
    requestAnimationFrame(() => {
      if (trunkRef.current) trunkRef.current.style.strokeDashoffset = '0';
    });

    branchRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.transition = `stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) ${0.9 + i * 0.13}s`;
      requestAnimationFrame(() => {
        if (el) el.style.strokeDashoffset = '0';
      });
    });
  }, [projects.length]);

  const activeProject = activeIdx !== null ? projects[activeIdx] : null;
  const activePos = activeIdx !== null ? NODE_POS[activeIdx % NODE_POS.length] : null;

  return (
    <div className="projectsTab">
      <div className="projectsContainer">

        <div className="projectsHeader">
          <p className="projectsPageTitle">projects</p>
          <h1 className="projectsPageCount">
            {filtered.length}<span>/{projects.length}</span>
          </h1>
        </div>

        {/* filter */}
        <div className="galaxyFilters">
          <span className="filterLabel">filter</span>
          <div className="filterBadges">
            {galaxyArray.map(g => (
              <button
                key={g.id}
                className={`filterBtn ${selectedGalaxy === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGalaxy(selectedGalaxy === g.id ? null : g.id)}
              >
                {g.id}
              </button>
            ))}
          </div>
        </div>

        {/* tree */}
        <div className="treeWrap">
          <svg
            ref={svgRef}
            className="treeSvg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glowBig">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="nodeGrad" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#8aaa7a" />
                <stop offset="100%" stopColor="#4d6641" />
              </radialGradient>
              <radialGradient id="nodeActive" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#b0cc9e" />
                <stop offset="100%" stopColor="#739166" />
              </radialGradient>
            </defs>

            {/* trunk */}
            <path
              ref={trunkRef}
              className="trunkPath"
              d={trunkPath}
            />

            {/* branches + nodes */}
            {projects.map((project, i) => {
              const pos = NODE_POS[i % NODE_POS.length];
              const path = branchPath(pos.ax, pos.ay, pos.x, pos.y);
              const isFiltered = selectedGalaxy !== null && !filteredSet.has(project.id);
              const isActive = activeIdx === i;

              return (
                <g key={project.id} className={`projectGroup ${isFiltered ? 'dimmed' : ''} ${isActive ? 'active' : ''}`}>
                  {/* branch */}
                  <path
                    ref={el => { branchRefs.current[i] = el; }}
                    className="branchPath"
                    d={path}
                  />
                  {/* glow layer when active */}
                  {isActive && (
                    <path className="branchGlow" d={path} />
                  )}
                  {/* node */}
                  <circle
                    className="nodeCircle"
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 13 : 9}
                    style={{ animationDelay: `${1.1 + i * 0.13}s` }}
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  />
                  {/* pulse ring */}
                  <circle
                    className="nodePulse"
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 13 : 9}
                    style={{ animationDelay: `${1.5 + i * 0.13}s` }}
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  />
                  {/* label */}
                  <text
                    className="nodeLabel"
                    x={pos.x}
                    y={pos.x < CX - 20 ? pos.y - 18 : pos.x > CX + 20 ? pos.y - 18 : pos.y - 20}
                    textAnchor={pos.x < CX - 60 ? 'end' : pos.x > CX + 60 ? 'start' : 'middle'}
                    dx={pos.x < CX - 60 ? -8 : pos.x > CX + 60 ? 8 : 0}
                    style={{ animationDelay: `${1.3 + i * 0.13}s` }}
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  >
                    {project.title}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* project card panel */}
          {activeProject && activePos && (
            <div
              className="treeCard"
              style={{
                left: `${Math.min(Math.max((activePos.x / W) * 100, 5), 60)}%`,
                top: `${Math.min(Math.max((activePos.y / H) * 100, 2), 70)}%`,
              }}
            >
              <button className="treeCardClose" onClick={() => setActiveIdx(null)}>×</button>
              <h2 className="treeCardTitle">
                  <MemorySpan queryKey={activeProject.title.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g,'-')}>
                    {activeProject.title}
                  </MemorySpan>
                </h2>
              <p className="treeCardDesc">{activeProject.description}</p>
              <div className="treeCardTech">
                {activeProject.tech.map((t, i) => (
                  <span key={i} className="treeCardTag">{t}</span>
                ))}
              </div>
              <div className="treeCardLinks">
                {activeProject.private ? (
                  <span className="treeCardPrivate"><FaGithub /> private</span>
                ) : (
                  <a href={activeProject.github} target="_blank" rel="noopener noreferrer" className="treeCardLink">
                    <FaGithub /> source
                  </a>
                )}
                {activeProject.url && (
                  <a href={activeProject.url} target="_blank" rel="noopener noreferrer" className="treeCardLink">
                    <FaExternalLinkAlt /> live
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* arbor embed outside the tree */}
        <div className="arborEmbed">
          <p className="arborEmbedLabel">arbor profile</p>
          <iframe
            src="https://arbor-blue.vercel.app/embeds/guha"
            width="450"
            height="680"
            title="Arbor Profile"
            className="arborEmbedFrame"
          />
        </div>

      </div>
    </div>
  );
}
