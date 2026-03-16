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

interface MediaItem {
  type: 'spotify_artist' | 'spotify_track' | 'youtube';
  id: string;   // Spotify artist/track ID or YouTube video ID
  label?: string;
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
  wikiQuery?: string;
  spotifyArtistId?: string; // for dynamic Spotify pins
  media?: MediaItem[];      // explicit embeds you want to show
}

interface WikiData {
  title: string;
  description: string;
  extract: string;
  image: string | null;
  url: string | null;
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
  { id: 'bangalore', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, queryKeywords: 'India Bangalore born family origins', category: 'home', description: 'Where I was born.', wikiQuery: 'Bangalore' },
  { id: 'houston', name: 'Houston, TX', lat: 29.7604, lng: -95.3698, queryKeywords: 'Houston home family Texas Sugar Land', category: 'home', description: 'Grew up here.', wikiQuery: 'Houston,_Texas',
    subLocations: [
      { name: 'Sugar Land', description: 'Suburb where I actually grew up. First Colony Mall territory.' },
      { name: 'Houston proper', description: 'The city itself — Uptown, Greenway Plaza, downtown.' },
    ],
  },
  { id: 'sf', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, queryKeywords: 'San Francisco Engramme co-op WeWork California Street Mission Dolores Golden Gate', category: 'work', description: 'Current base. Co-op at Engramme.', siteLink: { path: '/about', label: 'résumé → Engramme', scrollTo: 'engramme' }, wikiQuery: 'San_Francisco,Engramme_(neuroscience)',
    subLocations: [
      { name: '650 California St', description: "Engramme's WeWork office. 7th floor happy hours.", siteLink: { path: '/about', label: 'résumé → Engramme', scrollTo: 'engramme' } },
      { name: 'Golden Gate Park', description: 'DeYoung Museum, Cal Academy, biking.' },
      { name: 'Sausalito', description: 'Ebiked across the Golden Gate Bridge. ~1hr ride.' },
      { name: 'Clement St (home)', description: 'Where I live. Richmond district.' },
    ],
  },
  { id: 'boston', name: 'Boston, MA', lat: 42.3601, lng: -71.0589, queryKeywords: 'Northeastern Boston university campus Cambridge Harvard Engramme', category: 'school', description: 'Northeastern + where Engramme was founded.', siteLink: { path: '/about', label: 'résumé → Northeastern', scrollTo: 'education' }, wikiQuery: 'Boston,Northeastern_University',
    subLocations: [
      { name: 'Northeastern University', description: "Data Science + FinTech, Martinson Honors. Class of '28.", siteLink: { path: '/about', label: 'résumé → Northeastern', scrollTo: 'education' } },
      { name: 'Cambridge', description: 'Harvard Medical School — where Engramme was spun out.' },
      { name: 'Plymouth', description: 'Hacker house f25 trip — 22 Summer St.' },
    ],
  },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, queryKeywords: 'Chicago city visit', category: 'interest', description: 'Favorite city in the US.', wikiQuery: 'Chicago' },
  { id: 'la', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, queryKeywords: 'Los Angeles LA visit', category: 'interest', description: 'Visited.', wikiQuery: 'Los_Angeles' },
  { id: 'pacific-nw', name: 'Pacific Northwest', lat: 47.7511, lng: -120.7401, queryKeywords: 'Washington Pacific Northwest dream state', category: 'interest', description: 'Dream region.', wikiQuery: 'Pacific_Northwest,Olympic_National_Park' },
  { id: 'belgium', name: 'Belgium', lat: 50.7503, lng: 4.5000, queryKeywords: 'Belgium Policy Playground EU Leuven Brussels exchange basketball', category: 'project', description: 'Exchange semester. Built Policy Playground.', siteLink: { path: '/projects', label: 'projects → Policy Playground', scrollTo: 'project-leuven' }, wikiQuery: 'Leuven,KU_Leuven',
    subLocations: [
      { name: 'Leuven', description: 'Lived here during the exchange. Refugehof basketball, Cafe Belge.', siteLink: { path: '/projects', label: 'projects → Policy Playground', scrollTo: 'project-leuven' } },
      { name: 'Brussels', description: 'Policy Playground was built for an EU markets project.' },
      { name: 'Amsterdam', description: 'Day trip.' },
      { name: 'Luxembourg', description: 'Visited.' },
    ],
  },
  { id: 'petra', name: 'Petra, Jordan', lat: 30.3285, lng: 35.4444, queryKeywords: 'Petra Jordan Middle East travel', category: 'interest', description: 'Visited.', wikiQuery: 'Petra,_Jordan' },


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
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [, _setHoveredPolygon] = useState<any>(null);
  const setHoveredPolygon = _setHoveredPolygon;
  const [allLocations, setAllLocations] = useState<GlobeLocation[]>(LOCATIONS);
  const navigate = useNavigate();
  const spinRef = useRef<(loc: GlobeLocation) => void>(() => {});

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
    setWikiData(null);
    // Scroll globe section into view so panel is visible
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 1.8 }, 1200);
    }
    fetchMemories(loc.queryKeywords).then(setMemories).catch(() => {}).finally(() => setLoading(false));
    if (loc.wikiQuery) {
      // Encode each query separately to preserve commas as separators
      const encoded = loc.wikiQuery.split(',').map(s => encodeURIComponent(s.trim())).join(',');
      fetch(`/api/wiki?q=${encoded}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setWikiData(d); })
        .catch(() => {});
    } else {
      // For dynamic pins (Spotify artists etc), try the location name directly
      fetch(`/api/wiki?q=${encodeURIComponent(loc.name)}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setWikiData(d); })
        .catch(() => {});
    }
  }, [onPanelChange]);

  useEffect(() => { spinRef.current = spinToLocation; }, [spinToLocation]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    setWikiData(null);
    onPanelChange?.(false);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    window.history.replaceState({}, '', url.toString());
  }, [onPanelChange]);

  useEffect(() => {
    const pinId = new URLSearchParams(window.location.search).get('pin');
    if (!pinId) return;
    const tryPin = setInterval(() => {
      const loc = allLocations.find(l => l.id === pinId);
      if (globeRef.current && loc) { clearInterval(tryPin); spinToLocation(loc); }
    }, 200);
    return () => clearInterval(tryPin);
  }, [allLocations, spinToLocation]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    import('globe.gl').then(({ default: Globe }) => {
      if (!el) return;
      fetch(GEOJSON_URL).then(r => r.json()).then(({ features: countries }) => {
        if (!el) return;
        let hovered: any = null;
        const globe = (Globe({ animateIn: true, waitForGlobeReady: true }) as any)
          .width(el.clientWidth).height(el.clientHeight)
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true).atmosphereColor('rgba(115,145,102,0.35)').atmosphereAltitude(0.18)
          .polygonsData(countries)
          .polygonCapColor((f: any) => f === hovered ? '#1a2a14' : '#0e1a0a')
          .polygonSideColor(() => 'rgba(115,145,102,0.03)')
          .polygonStrokeColor(() => 'rgba(115,145,102,0.55)')
          .polygonAltitude((f: any) => f === hovered ? 0.016 : 0.006)
          .onPolygonHover((poly: any) => {
            hovered = poly; setHoveredPolygon(poly);
            globe.polygonCapColor((f: any) => f === hovered ? '#1a2a14' : '#0e1a0a')
                 .polygonAltitude((f: any) => f === hovered ? 0.016 : 0.006);
          })
          .pointsData(LOCATIONS)
          .pointLat((d: any) => d.lat).pointLng((d: any) => d.lng)
          .pointColor((d: any) => CATEGORY_COLORS[d.category as Category] ?? '#739166')
          .pointAltitude(0.06).pointRadius(0.4).pointResolution(12)
          .pointLabel((d: any) => {
            const c = CATEGORY_COLORS[d.category as Category] ?? '#739166';
            return `<div style="background:rgba(8,8,8,0.95);border:1px solid ${c};padding:5px 9px;font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:#f0f0f0;white-space:nowrap;border-radius:2px">${d.name}</div>`;
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
        ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.5;
        ctrl.enableZoom = true; ctrl.enableDamping = true; ctrl.dampingFactor = 0.08;
        ctrl.minDistance = 150; ctrl.maxDistance = 550;
        window.addEventListener('resize', () => { if (el && globe) globe.width(el.clientWidth).height(el.clientHeight); });
      });
    });
    return () => { if (globeRef.current?._destructor) globeRef.current._destructor(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (globeRef.current) globeRef.current.pointsData(allLocations); }, [allLocations]);

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
            {/* Hero — wiki image if available, else category gradient */}
            <div
              className="wikiHero"
              style={wikiData?.image
                ? { backgroundImage: `url(${wikiData.image})` }
                : { background: `linear-gradient(135deg, ${CATEGORY_COLORS[selected.category]}22 0%, #0a0a0a 100%)` }
              }
            >
              <div className="wikiHeroOverlay" />
              <div className="wikiHeroText">
                <span className="panelCat" style={{ color: CATEGORY_COLORS[selected.category] }}>[{selected.category}]</span>
                <h2 className="panelName">{selected.name}</h2>
                {wikiData?.description && <p className="wikiDesc">{wikiData.description}</p>}
              </div>
              <button className="panelClose panelCloseHero" onClick={closePanel}>✕</button>
            </div>

            {/* WHY I'M HERE — prominent personal reason */}
            <div className="panelWhyBlock" style={{ borderLeftColor: CATEGORY_COLORS[selected.category] }}>
              <span className="panelWhyLabel" style={{ color: CATEGORY_COLORS[selected.category] }}>why i'm here</span>
              <p className="panelWhy">{selected.description}</p>
              {selected.siteLink && (
                <button className="panelSiteLink" onClick={() => handleSiteLink(selected.siteLink!)}>
                  → {selected.siteLink.label}
                </button>
              )}
            </div>

            {/* Wikipedia extract */}
            {wikiData?.extract && (
              <>
                <div className="panelDivider" />
                <div className="wikiExtract">
                  <p className="wikiExtractLabel">wikipedia</p>
                  <p className="wikiExtractText">{wikiData.extract.length > 400 ? wikiData.extract.slice(0, 400) + '…' : wikiData.extract}</p>
                  {wikiData.url && <a href={wikiData.url} target="_blank" rel="noopener noreferrer" className="wikiLink">read more →</a>}
                </div>
              </>
            )}

            {/* Sub-locations */}
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
            {/* Media embeds — Spotify, YouTube, etc. */}
            {(() => {
              const items: MediaItem[] = [
                ...(selected.media ?? []),
                // Dynamic Spotify pins auto-get an artist embed
                // Dynamic Spotify pins: derive artist ID from pin id (music-{artistId})
                ...(selected.id.startsWith('music-') && !selected.media
                  ? [{ type: 'spotify_artist' as const, id: selected.id.replace('music-', ''), label: selected.description }]
                  : []),
              ];
              if (!items.length) return null;
              return (
                <>
                  <div className="mediaSection">
                    {items.map((item, i) => {
                      if (item.type === 'spotify_artist') {
                        return (
                          <div key={i} className="mediaEmbed">
                            {item.label && <p className="mediaLabel">♫ {item.label}</p>}
                            <iframe
                              src={`https://open.spotify.com/embed/artist/${item.id}?utm_source=generator&theme=0`}
                              width="100%" height="152"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              style={{ borderRadius: '6px' }}
                            />
                          </div>
                        );
                      }
                      if (item.type === 'spotify_track') {
                        return (
                          <div key={i} className="mediaEmbed">
                            {item.label && <p className="mediaLabel">♫ {item.label}</p>}
                            <iframe
                              src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator&theme=0`}
                              width="100%" height="80"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              style={{ borderRadius: '6px' }}
                            />
                          </div>
                        );
                      }
                      if (item.type === 'youtube') {
                        return (
                          <div key={i} className="mediaEmbed">
                            {item.label && <p className="mediaLabel">▶ {item.label}</p>}
                            <iframe
                              src={`https://www.youtube.com/embed/${item.id}`}
                              width="100%" height="180"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              style={{ borderRadius: '6px' }}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div className="panelDivider" />
                </>
              );
            })()}
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
