import { useEffect, useRef, useState, useCallback } from 'react';
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
  {
    id: 'houston',
    name: 'Houston, TX',
    lat: 29.7604, lng: -95.3698,
    queryKeywords: 'Houston home family Texas',
    category: 'home',
    description: 'Hometown. Where it started.',
  },
  {
    id: 'sf',
    name: 'San Francisco, CA',
    lat: 37.7749, lng: -122.4194,
    queryKeywords: 'San Francisco Engramme co-op Mission Dolores',
    category: 'work',
    description: 'Building at Engramme. Current base.',
  },
  {
    id: 'boston',
    name: 'Boston / Northeastern',
    lat: 42.3601, lng: -71.0589,
    queryKeywords: 'Northeastern Boston university campus co-op',
    category: 'school',
    description: 'Data Science + FinTech. Martinson Honors.',
  },
  {
    id: 'cambridge',
    name: 'Cambridge (Harvard)',
    lat: 42.3736, lng: -71.1097,
    queryKeywords: 'Harvard Engramme spinout Mayfield Fund AI',
    category: 'work',
    description: 'Where Engramme was born.',
  },
  {
    id: 'belgium',
    name: 'Brussels, Belgium',
    lat: 50.8503, lng: 4.3517,
    queryKeywords: 'Belgium Policy Playground financial markets',
    category: 'project',
    description: 'Built Policy Playground here.',
  },
  {
    id: 'london',
    name: 'London, UK',
    lat: 51.5074, lng: -0.1278,
    queryKeywords: 'London UK philosophy music shoegaze',
    category: 'interest',
    description: 'My Bloody Valentine country.',
  },
  {
    id: 'seoul',
    name: 'Seoul, South Korea',
    lat: 37.5665, lng: 126.9780,
    queryKeywords: 'Parannoul Seoul Korean shoegaze music',
    category: 'interest',
    description: 'Parannoul. The best shoegaze record in years.',
  },
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

const GlobeSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [selected, setSelected] = useState<GlobeLocation | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [, _setHoveredPolygon] = useState<any>(null);
  const setHoveredPolygon = _setHoveredPolygon;

  const handlePointClick = useCallback(async (point: object) => {
    const loc = point as GlobeLocation;
    setSelected(loc);
    setPanelOpen(true);
    setLoading(true);
    setMemories([]);

    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.8 }, 1200);
    }

    try {
      const mems = await fetchMemories(loc.queryKeywords);
      setMemories(mems);
    } catch (e) {
      console.error('Engramme fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    import('globe.gl').then(({ default: Globe }) => {
      if (!el) return;

      Promise.all([
        fetch(GEOJSON_URL).then(r => r.json()),
      ]).then(([{ features: countries }]) => {
        if (!el) return;

        let hovered: any = null;

        const globe = Globe({ animateIn: true, waitForGlobeReady: true })
          .width(el.clientWidth as any)
          .height(el.clientHeight)
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
          .pointLat('lat')
          .pointLng('lng')
          .pointColor((d: any) => CATEGORY_COLORS[d.category as Category] ?? '#739166')
          .pointAltitude(0.04)
          .pointRadius(0.55)
          .pointsMerge(false)
          .pointLabel((d: any) => `
            <div style="background:rgba(20,4,4,0.95);border:1.5px solid ${CATEGORY_COLORS[d.category as Category]};border-radius:8px;padding:10px 14px;font-family:'Courier New',monospace;max-width:220px">
              <div style="color:${CATEGORY_COLORS[d.category as Category]};font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">[${d.category}]</div>
              <div style="color:#739166;font-weight:700;font-size:0.95rem;margin-bottom:4px">${d.name}</div>
              <div style="color:rgba(115,145,102,0.7);font-size:0.82rem">${d.description}</div>
            </div>
          `)
          .onPointClick(handlePointClick)
          .labelsData(LOCATIONS)
          .labelLat('lat')
          .labelLng('lng')
          .labelText('name')
          .labelSize(1.4)
          .labelColor((d: any) => `${CATEGORY_COLORS[d.category as Category]}cc`)
          .labelResolution(2)
          .labelAltitude(0.055)
          (el);

        globeRef.current = globe;

        // Style the globe sphere itself (ocean = near-black deep maroon)
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

        const ctrl = globe.controls();
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.5;
        ctrl.enableZoom = true;
        ctrl.enableDamping = true;
        ctrl.dampingFactor = 0.08;
        ctrl.minDistance = 150;
        ctrl.maxDistance = 550;

        const onResize = () => {
          if (el && globe) {
            globe.width(el.clientWidth).height(el.clientHeight);
          }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      });
    });

    return () => {
      if (globeRef.current?._destructor) globeRef.current._destructor();
    };
  }, [handlePointClick]);

  const sourceColor: Record<string, string> = {
    stream:      '#ffd700',
    email:       '#87ceeb',
    claude_code: '#7fff98',
    codex:       '#6b4e71',
  };

  return (
    <div className="globeSection">
      {/* Globe canvas */}
      <div className="globeCanvas" ref={containerRef} />

      {/* Legend */}
      <div className="globeLegend">
        {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(([cat, color]) => (
          <div key={cat} className="legendItem">
            <span className="legendDot" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="legendLabel">{cat}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      {!panelOpen && (
        <div className="globeHint">
          <span>click a pin to pull memories</span>
        </div>
      )}

      {/* Memory panel */}
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
              </div>
              <button className="panelClose" onClick={closePanel}>✕</button>
            </div>

            <div className="panelDivider" />

            <p className="panelMemLabel">ENGRAMME RECALL</p>

            {loading && (
              <div className="memLoading">
                <span /><span /><span />
              </div>
            )}

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
