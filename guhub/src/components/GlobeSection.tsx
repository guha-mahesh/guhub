import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobeSection.css';

const ENGRAMME_API = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev/v1/memories/recall';
const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

type Category = 'home' | 'work' | 'school' | 'project' | 'interest';

interface SubLocation {
  name: string;
  description: string;
  queryKeywords?: string;
  siteLink?: { path: string; label: string; external?: boolean; scrollTo?: string };
}

interface GlobeLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  queryKeywords: string;
  category: Category;
  description: string;
  subLocations?: SubLocation[];
  siteLink?: { path: string; label: string; external?: boolean; scrollTo?: string };
}

interface Memory {
  source: string;
  headline: string;
  narrative: string;
  date: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  home:     '#ff9eb5',
  work:     '#ffd700',
  school:   '#87ceeb',
  project:  '#7fff98',
  interest: '#b39ddb',
};

const LOCATIONS: GlobeLocation[] = [
  { id: 'bangalore', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, queryKeywords: 'India Bangalore born family origins', category: 'home', description: 'Where I was born.' },
  { id: 'houston', name: 'Houston, TX', lat: 29.7604, lng: -95.3698, queryKeywords: 'Houston home family Texas Sugar Land', category: 'home', description: 'Grew up here.',
    subLocations: [
      { name: 'Sugar Land', description: 'Suburb where I actually grew up. First Colony Mall territory.', queryKeywords: 'Sugar Land Houston Texas First Colony Mall' },
      { name: 'Houston proper', description: 'The city itself — Uptown, Greenway Plaza, downtown.' },
    ],
  },
  { id: 'sf', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, queryKeywords: 'San Francisco Engramme co-op WeWork California Street Mission Dolores Golden Gate', category: 'work', description: 'Current base. Co-op at Engramme.', siteLink: { path: '/about', label: 'résumé → Engramme', scrollTo: 'engramme' },
    subLocations: [
      { name: '650 California St', description: "Engramme's WeWork office. 7th floor happy hours.", queryKeywords: 'WeWork 650 California Engramme office', siteLink: { path: '/about', label: 'résumé → Engramme', scrollTo: 'engramme' } },
      { name: 'Golden Gate Park', description: 'DeYoung Museum, Cal Academy, biking.', queryKeywords: 'Golden Gate Park DeYoung Museum Cal Academy bike' },
      { name: 'Sausalito', description: 'Ebiked across the Golden Gate Bridge. ~1hr ride.', queryKeywords: 'Sausalito ebike Golden Gate Bridge' },
      { name: 'Clement St (home)', description: 'Where I live. Richmond district.', queryKeywords: 'Clement Street Richmond apartment home SF' },
    ],
  },
  { id: 'boston', name: 'Boston, MA', lat: 42.3601, lng: -71.0589, queryKeywords: 'Northeastern Boston university campus Cambridge Harvard Engramme', category: 'school', description: 'Northeastern + where Engramme was founded.', siteLink: { path: '/about', label: 'résumé → Northeastern', scrollTo: 'education' },
    subLocations: [
      { name: 'Northeastern University', description: "Data Science + FinTech, Martinson Honors. Class of '28.", queryKeywords: 'Northeastern Boston university campus', siteLink: { path: '/about', label: 'résumé → Northeastern', scrollTo: 'education' } },
      { name: 'Cambridge', description: 'Harvard Medical School — where Engramme was spun out.', queryKeywords: 'Harvard Engramme spinout Cambridge Mayfield' },
      { name: 'Plymouth', description: 'Hacker house f25 trip — 22 Summer St.', queryKeywords: 'Plymouth hacker house f25 trip group' },
    ],
  },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, queryKeywords: 'Chicago city visit', category: 'interest', description: 'Favorite city in the US.' },
  { id: 'la', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, queryKeywords: 'Los Angeles LA visit', category: 'interest', description: 'Visited.' },
  { id: 'pacific-nw', name: 'Pacific Northwest', lat: 47.7511, lng: -120.7401, queryKeywords: 'Washington Pacific Northwest dream state', category: 'interest', description: 'Dream region.' },
  { id: 'belgium', name: 'Belgium', lat: 50.7503, lng: 4.5000, queryKeywords: 'Belgium Policy Playground EU Leuven Brussels exchange basketball', category: 'project', description: 'Exchange semester. Built Policy Playground.', siteLink: { path: '/projects', label: 'projects → Policy Playground', scrollTo: 'project-leuven' },
    subLocations: [
      { name: 'Leuven', description: 'Lived here during the exchange. Refugehof basketball, Cafe Belge.', queryKeywords: 'Leuven Belgium basketball Refugehof cafe belge', siteLink: { path: '/projects', label: 'projects → Policy Playground', scrollTo: 'project-leuven' } },
      { name: 'Brussels', description: 'Policy Playground was built for an EU markets project.', queryKeywords: 'Belgium Policy Playground EU financial markets Brussels' },
      { name: 'Amsterdam', description: 'Day trip.', queryKeywords: 'Amsterdam Netherlands Europe travel' },
      { name: 'Luxembourg', description: 'Visited.', queryKeywords: 'Luxembourg Europe travel' },
    ],
  },
  { id: 'petra', name: 'Petra, Jordan', lat: 30.3285, lng: 35.4444, queryKeywords: 'Petra Jordan Middle East travel', category: 'interest', description: 'Visited.' },
  { id: 'british-isles', name: 'British Isles', lat: 54.0, lng: -3.5, queryKeywords: 'Dublin My Bloody Valentine Cocteau Twins Scotland Ireland shoegaze', category: 'interest', description: 'Home of some of my favorite bands.',
    subLocations: [
      { name: 'Dublin, Ireland', description: 'My Bloody Valentine formed here.', queryKeywords: 'My Bloody Valentine Dublin Ireland shoegaze', siteLink: { path: '/listening', label: 'listening → MBV' } },
      { name: 'Grangemouth, Scotland', description: 'Cocteau Twins are from here.', queryKeywords: 'Cocteau Twins Scotland Grangemouth dream pop', siteLink: { path: '/listening', label: 'listening → Cocteau Twins' } },
    ],
  },
  { id: 'seoul', name: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780, queryKeywords: 'Parannoul Seoul Korean shoegaze music', category: 'interest', description: 'Parannoul.', siteLink: { path: '/listening', label: 'listening → Parannoul' } },
  { id: 'sacramento', name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944, queryKeywords: 'Death Grips Sacramento experimental hip hop', category: 'interest', description: 'Death Grips.', siteLink: { path: '/listening', label: 'listening → Death Grips' } },
];

async function fetchMemories(keywords: string): Promise<Memory[]> {
  const form = new FormData();
  form.append('text', keywords);
  form.append('top_k', '8');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');
  const res = await fetch(ENGRAMME_API, { method: 'POST', headers: { 'x-api-key': API_KEY }, body: form });
  const data = await res.json();
  const mems: any[] = data.memories || [];
  mems.sort((a, b) => (b?.content?.when?.event_start_time || '').localeCompare(a?.content?.when?.event_start_time || ''));
  return mems.map(m => ({ source: m.source || '?', headline: m.content?.headline || '', narrative: m.content?.narrative || '', date: m.content?.when?.event_start_time?.slice(0, 10) || '' }));
}

const GlobeSection = ({ onPanelChange }: { onPanelChange?: (open: boolean) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [selected, setSelected] = useState<GlobeLocation | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [, _setHoveredPolygon] = useState<any>(null);
  const setHoveredPolygon = _setHoveredPolygon;
  const [allLocations, setAllLocations] = useState<GlobeLocation[]>(LOCATIONS);
  const navigate = useNavigate();
  const spinRef = useRef<(loc: GlobeLocation) => void>(() => {});

  // Spotify top artists dynamic pins
  useEffect(() => {
    fetch('/api/spotify/top-artists').then(r => r.json()).then(data => {
      if (data.pins?.length) {
        setAllLocations(prev => {
          const seen = new Set(prev.map(l => l.id));
          return [...prev, ...data.pins.filter((p: GlobeLocation) => !seen.has(p.id))];
        });
      }
    }).catch(() => {});
  }, []);

  const spinToLocation = useCallback((loc: GlobeLocation) => {
    setSelected(loc);
    setPanelOpen(true);
    onPanelChange?.(true);
    setLoading(true);
    setMemories([]);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.8 }, 1200);
    }
    fetchMemories(loc.queryKeywords).then(setMemories).catch(() => {}).finally(() => setLoading(false));
  }, [onPanelChange]);

  // Keep ref fresh — this is what the globe's click handlers use
  useEffect(() => { spinRef.current = spinToLocation; }, [spinToLocation]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    onPanelChange?.(false);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    window.history.replaceState({}, '', url.toString());
  }, [onPanelChange]);

  // ?pin= URL param
  useEffect(() => {
    const pinId = new URLSearchParams(window.location.search).get('pin');
    if (!pinId) return;
    const tryPin = setInterval(() => {
      const loc = allLocations.find(l => l.id === pinId);
      if (globeRef.current && loc) { clearInterval(tryPin); spinToLocation(loc); }
    }, 200);
    return () => clearInterval(tryPin);
  }, [allLocations, spinToLocation]);

  // Globe init — runs once
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    import('globe.gl').then(({ default: Globe }) => {
      if (!el) return;
      fetch(GEOJSON_URL).then(r => r.json()).then(({ features: countries }) => {
        if (!el) return;
        let hovered: any = null;

        const makePin = (d: GlobeLocation) => {
          const color = CATEGORY_COLORS[d.category] ?? '#739166';
          const div = document.createElement('div');
          div.style.cssText = 'width:14px;height:14px;position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;';
          div.innerHTML = `
            <div style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 0 2px rgba(0,0,0,0.9),0 0 10px ${color}99;transition:transform 0.15s;flex-shrink:0;"></div>
            <div style="position:absolute;inset:-3px;border-radius:50%;border:1.5px solid ${color}55;animation:pinPulse 2.5s ease-out infinite;pointer-events:none;"></div>
          `;
          const dot = div.firstElementChild as HTMLElement;
          div.addEventListener('mouseenter', () => { dot.style.transform = 'scale(1.8)'; });
          div.addEventListener('mouseleave', () => { dot.style.transform = ''; });
          div.addEventListener('click', (e) => { e.stopPropagation(); spinRef.current(d); });
          return div;
        };

        // Inject keyframe
        if (!document.getElementById('globe-pin-style')) {
          const s = document.createElement('style');
          s.id = 'globe-pin-style';
          s.textContent = '@keyframes pinPulse{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.6);opacity:0}}';
          document.head.appendChild(s);
        }

        const globe = (Globe({ animateIn: true, waitForGlobeReady: true }) as any)
          .width(el.clientWidth).height(el.clientHeight)
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('rgba(115,145,102,0.35)')
          .atmosphereAltitude(0.18)
          .polygonsData(countries)
          .polygonCapColor((f: any) => f === hovered ? '#1a2a14' : '#0e1a0a')
          .polygonSideColor(() => 'rgba(115,145,102,0.03)')
          .polygonStrokeColor(() => 'rgba(115,145,102,0.55)')
          .polygonAltitude((f: any) => f === hovered ? 0.016 : 0.006)
          .onPolygonHover((poly: any) => {
            hovered = poly;
            setHoveredPolygon(poly);
            globe.polygonCapColor((f: any) => f === hovered ? '#1a2a14' : '#0e1a0a')
                 .polygonAltitude((f: any) => f === hovered ? 0.016 : 0.006);
          })
          .pointsData(LOCATIONS)
          .pointLat((d: any) => d.lat)
          .pointLng((d: any) => d.lng)
          .pointColor((d: any) => CATEGORY_COLORS[d.category as Category] ?? '#739166')
          .pointAltitude(0.015)
          .pointRadius(0.35)
          .pointLabel((d: any) => {
            const color = CATEGORY_COLORS[d.category as Category] ?? '#739166';
            return `<div style="background:rgba(8,8,8,0.95);border:1px solid ${color};padding:5px 9px;font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:#f0f0f0;white-space:nowrap;border-radius:2px">${d.name}</div>`;
          })
          .onPointClick((point: any) => { spinRef.current(point as GlobeLocation); })
          (el);

        globeRef.current = globe;

        setTimeout(() => {
          globe.scene().traverse((obj: any) => {
            if (obj.isMesh && obj.geometry?.parameters?.radius > 50) {
              obj.material?.color?.set('#060d04');
              if (obj.material) obj.material.needsUpdate = true;
            }
          });
        }, 100);

        const ctrl = globe.controls() as any;
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.5;
        ctrl.enableZoom = true;
        ctrl.enableDamping = true;
        ctrl.dampingFactor = 0.08;
        ctrl.minDistance = 150;
        ctrl.maxDistance = 550;

        window.addEventListener('resize', () => {
          if (el && globe) globe.width(el.clientWidth).height(el.clientHeight);
        });
      });
    });
    return () => { if (globeRef.current?._destructor) globeRef.current._destructor(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update points when Spotify pins load
  useEffect(() => {
    if (globeRef.current) globeRef.current.pointsData(allLocations);
  }, [allLocations]);

  const handleSiteLink = (link: NonNullable<GlobeLocation['siteLink']>) => {
    if (link.external) { window.open(link.path, '_blank'); return; }
    navigate(link.path);
    if (link.scrollTo) setTimeout(() => document.getElementById(link.scrollTo!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  };

  const sourceColor: Record<string, string> = { stream: '#ffd700', email: '#87ceeb', claude_code: '#7fff98', codex: '#6b4e71' };

  return (
    <div className="globeSection">
      <div className="globeCanvas" ref={containerRef}
        onMouseEnter={() => { if (globeRef.current && !panelOpen) globeRef.current.controls().autoRotate = false; }}
        onMouseLeave={() => { if (globeRef.current && !panelOpen) globeRef.current.controls().autoRotate = true; }}
      />

      <div className="globeLegend">
        {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(([cat, color]) => (
          <div key={cat} className="legendItem">
            <span className="legendDot" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="legendLabel">{cat}</span>
          </div>
        ))}
      </div>

      {!panelOpen && <div className="globeHint"><span>click a pin to explore</span></div>}

      <div className={`memoryPanel ${panelOpen ? 'open' : ''}`}>
        {selected && (
          <>
            <div className="panelHeader">
              <div>
                <span className="panelCat" style={{ color: CATEGORY_COLORS[selected.category] }}>[{selected.category}]</span>
                <h2 className="panelName">{selected.name}</h2>
                <p className="panelDesc">{selected.description}</p>
                {selected.siteLink && (
                  <button className="panelSiteLink" onClick={() => handleSiteLink(selected.siteLink!)}>
                    → {selected.siteLink.label}
                  </button>
                )}
              </div>
              <button className="panelClose" onClick={closePanel}>✕</button>
            </div>

            {selected.subLocations && selected.subLocations.length > 0 && (
              <>
                <div className="panelDivider" />
                <div className="subLocList">
                  {selected.subLocations.map((sub, i) => (
                    <div key={i} className="subLocItem">
                      <div className="subLocDot" style={{ backgroundColor: CATEGORY_COLORS[selected.category] }} />
                      <div className="subLocBody">
                        <span className="subLocName">{sub.name}</span>
                        <span className="subLocDesc">{sub.description}</span>
                        {sub.siteLink && <button className="subLocLink" onClick={() => handleSiteLink(sub.siteLink!)}>→ {sub.siteLink.label}</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="panelDivider" />
            {loading && <div className="memLoading"><span /><span /><span /></div>}
            {!loading && memories.length > 0 && (
              <>
                <p className="panelMemLabel">ENGRAMME RECALL</p>
                <div className="memList">
                  {memories.map((m, i) => (
                    <div key={i} className="memCard">
                      <div className="memMeta">
                        <span className="memSource" style={{ color: sourceColor[m.source] ?? '#739166' }}>[{m.source}]</span>
                        <span className="memDate">{m.date}</span>
                      </div>
                      <p className="memHeadline">{m.headline}</p>
                      {m.narrative && <p className="memNarrative">{m.narrative.length > 280 ? m.narrative.slice(0, 280) + '…' : m.narrative}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GlobeSection;
