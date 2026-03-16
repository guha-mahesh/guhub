import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobeSection.css';

const ENGRAMME_API = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev/v1/memories/recall';
const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

type Category = 'home' | 'work' | 'school' | 'project' | 'interest';

interface GlobeLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  queryKeywords: string;
  category: Category;
  description: string;
  siteLink?: { path: string; label: string };
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
  interest: '#6b4e71',
};

const LOCATIONS: GlobeLocation[] = [
  { id: 'bangalore', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946,
    queryKeywords: 'India Bangalore born family origins', category: 'home',
    description: 'Born here.' },
  { id: 'houston', name: 'Houston, TX', lat: 29.7604, lng: -95.3698,
    queryKeywords: 'Houston home family Texas', category: 'home',
    description: 'Grew up here.',
    siteLink: { path: '/about', label: 'résumé' } },
  { id: 'sf', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194,
    queryKeywords: 'San Francisco Engramme co-op Mission Dolores', category: 'work',
    description: 'Current base. Building at Engramme.',
    siteLink: { path: '/about', label: 'résumé' } },
  { id: 'boston', name: 'Boston / Northeastern', lat: 42.3601, lng: -71.0589,
    queryKeywords: 'Northeastern Boston university campus co-op', category: 'school',
    description: 'Data Science + FinTech, Martinson Honors Program.',
    siteLink: { path: '/about', label: 'résumé' } },
  { id: 'cambridge', name: 'Cambridge, MA', lat: 42.3736, lng: -71.1097,
    queryKeywords: 'Harvard Engramme spinout Mayfield Fund AI', category: 'work',
    description: 'Where Engramme was founded.',
    siteLink: { path: '/projects', label: 'projects' } },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298,
    queryKeywords: 'Chicago city visit', category: 'interest',
    description: 'Favorite city in the US.' },
  { id: 'la', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437,
    queryKeywords: 'Los Angeles LA visit', category: 'interest',
    description: 'Visited.' },
  { id: 'washington', name: 'Pacific Northwest', lat: 47.7511, lng: -120.7401,
    queryKeywords: 'Washington Pacific Northwest dream state', category: 'interest',
    description: 'Dream region.' },
  { id: 'belgium', name: 'Brussels, Belgium', lat: 50.8503, lng: 4.3517,
    queryKeywords: 'Belgium Policy Playground EU financial markets', category: 'project',
    description: 'Built Policy Playground here for an EU project.',
    siteLink: { path: '/projects', label: 'projects' } },
  { id: 'amsterdam', name: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041,
    queryKeywords: 'Amsterdam Netherlands Europe travel', category: 'interest',
    description: 'Visited.' },
  { id: 'luxembourg', name: 'Luxembourg', lat: 49.6117, lng: 6.1319,
    queryKeywords: 'Luxembourg Europe travel', category: 'interest',
    description: 'Visited.' },
  { id: 'petra', name: 'Petra, Jordan', lat: 30.3285, lng: 35.4444,
    queryKeywords: 'Petra Jordan Middle East travel', category: 'interest',
    description: 'Visited Petra.' },
  { id: 'seoul', name: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780,
    queryKeywords: 'Parannoul Seoul Korean shoegaze music', category: 'interest',
    description: 'Parannoul.',
    siteLink: { path: '/listening', label: 'listening' } },
  { id: 'manchester', name: 'Manchester, UK', lat: 53.4808, lng: -2.2426,
    queryKeywords: 'My Bloody Valentine shoegaze UK music', category: 'interest',
    description: 'My Bloody Valentine formed here.',
    siteLink: { path: '/listening', label: 'listening' } },
  { id: 'edinburgh', name: 'Edinburgh, Scotland', lat: 55.9533, lng: -3.1883,
    queryKeywords: 'Cocteau Twins Scotland dream pop music', category: 'interest',
    description: 'Cocteau Twins are from here.',
    siteLink: { path: '/listening', label: 'listening' } },
  { id: 'sacramento', name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944,
    queryKeywords: 'Death Grips Sacramento experimental hip hop', category: 'interest',
    description: 'Death Grips.',
    siteLink: { path: '/listening', label: 'listening' } },
];

async function fetchMemories(keywords: string): Promise<Memory[]> {
  const form = new FormData();
  form.append('text', keywords);
  form.append('top_k', '8');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');
  const res = await fetch(ENGRAMME_API, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: form,
  });
  const data = await res.json();
  const mems: any[] = data.memories || [];
  mems.sort((a, b) => {
    const ta = a?.content?.when?.event_start_time || '';
    const tb = b?.content?.when?.event_start_time || '';
    return tb.localeCompare(ta);
  });
  return mems.map(m => ({
    source: m.source || '?',
    headline: m.content?.headline || '',
    narrative: m.content?.narrative || '',
    date: m.content?.when?.event_start_time?.slice(0, 10) || '',
  }));
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
  const navigate = useNavigate();

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
    fetchMemories(loc.queryKeywords)
      .then(mems => setMemories(mems))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePointClick = useCallback((point: object) => {
    spinToLocation(point as GlobeLocation);
  }, [spinToLocation]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    onPanelChange?.(false);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
    // clear pin param
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Read ?pin= param on mount and spin to that location
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinId = params.get('pin');
    if (!pinId) return;
    const loc = LOCATIONS.find(l => l.id === pinId);
    if (!loc) return;
    // wait for globe to be ready
    const tryPin = setInterval(() => {
      if (globeRef.current) {
        clearInterval(tryPin);
        spinToLocation(loc);
      }
    }, 200);
    return () => clearInterval(tryPin);
  }, [spinToLocation]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    import('globe.gl').then(({ default: Globe }) => {
      if (!el) return;
      Promise.all([fetch(GEOJSON_URL).then(r => r.json())]).then(([{ features: countries }]) => {
        if (!el) return;
        let hovered: any = null;
        const globe = Globe({ animateIn: true, waitForGlobeReady: true })
          .width(el.clientWidth as any).height(el.clientHeight)
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('rgba(115,145,102,0.35)')
          .atmosphereAltitude(0.18)
          .polygonsData(countries)
          .polygonCapColor((feat: any) => feat === hovered ? '#1a2a14' : '#0e1a0a')
          .polygonSideColor(() => 'rgba(115,145,102,0.03)')
          .polygonStrokeColor(() => 'rgba(115,145,102,0.55)')
          .polygonAltitude((feat: any) => feat === hovered ? 0.016 : 0.006)
          .onPolygonHover((poly: any) => {
            hovered = poly;
            setHoveredPolygon(poly);
            globe
              .polygonCapColor((f: any) => f === hovered ? '#1a2a14' : '#0e1a0a')
              .polygonAltitude((f: any) => f === hovered ? 0.016 : 0.006);
          })
          .pointsData(LOCATIONS)
          .pointLat((d: any) => d.lat)
          .pointLng((d: any) => d.lng)
          .pointColor((d: any) => CATEGORY_COLORS[d.category as Category] ?? '#739166')
          .pointAltitude(() => 0.04)
          .pointRadius(() => 0.55)
          .pointLabel((d: any) => `
            <div style="background:rgba(8,8,8,0.95);border:1px solid ${CATEGORY_COLORS[d.category as Category]};padding:8px 12px;font-family:'IBM Plex Mono',monospace;max-width:200px">
              <div style="color:${CATEGORY_COLORS[d.category as Category]};font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px">${d.category}</div>
              <div style="color:#f0f0f0;font-weight:700;font-size:0.85rem;margin-bottom:3px">${d.name}</div>
              <div style="color:#666;font-size:0.72rem">${d.description}</div>
            </div>
          `)
          .onPointClick(handlePointClick)
          (el);

        globeRef.current = globe;

        setTimeout(() => {
          globe.scene().traverse((obj: any) => {
            if (obj.isMesh && obj.geometry?.parameters?.radius > 50) {
              if (obj.material?.color) {
                obj.material.color.set('#060d04');
                obj.material.needsUpdate = true;
              }
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

        const onResize = () => { if (el && globe) globe.width(el.clientWidth).height(el.clientHeight); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      });
    });
    return () => { if (globeRef.current?._destructor) globeRef.current._destructor(); };
  }, [handlePointClick]);

  const sourceColor: Record<string, string> = {
    stream: '#ffd700', email: '#87ceeb', claude_code: '#7fff98', codex: '#6b4e71',
  };

  return (
    <div className="globeSection">
      <div className="globeCanvas" ref={containerRef} />

      <div className="globeLegend">
        {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(([cat, color]) => (
          <div key={cat} className="legendItem">
            <span className="legendDot" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="legendLabel">{cat}</span>
          </div>
        ))}
      </div>

      {!panelOpen && <div className="globeHint"><span>click a pin to pull memories</span></div>}

      <div className={`memoryPanel ${panelOpen ? 'open' : ''}`}>
        {selected && (
          <>
            <div className="panelHeader">
              <div>
                <span className="panelCat" style={{ color: CATEGORY_COLORS[selected.category] }}>
                  [{selected.category}]
                </span>
                <h2 className="panelName">{selected.name}</h2>
                <p className="panelDesc">{selected.description}</p>
                {selected.siteLink && (
                  <button
                    className="panelSiteLink"
                    onClick={() => navigate(selected.siteLink!.path)}
                  >
                    → {selected.siteLink.label}
                  </button>
                )}
              </div>
              <button className="panelClose" onClick={closePanel}>✕</button>
            </div>

            <div className="panelDivider" />
            <p className="panelMemLabel">ENGRAMME RECALL</p>

            {loading && <div className="memLoading"><span /><span /><span /></div>}
            {!loading && memories.length === 0 && (
              <p className="memEmpty">no memories surfaced for this location</p>
            )}

            <div className="memList">
              {memories.map((m, i) => (
                <div key={i} className="memCard">
                  <div className="memMeta">
                    <span className="memSource" style={{ color: sourceColor[m.source] ?? '#739166' }}>
                      [{m.source}]
                    </span>
                    <span className="memDate">{m.date}</span>
                  </div>
                  <p className="memHeadline">{m.headline}</p>
                  {m.narrative && (
                    <p className="memNarrative">
                      {m.narrative.length > 280 ? m.narrative.slice(0, 280) + '…' : m.narrative}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GlobeSection;
