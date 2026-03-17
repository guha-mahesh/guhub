import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobeSection.css';

const ENGRAMME_API = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev/v1/memories/recall';
const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

type Category = 'home' | 'work' | 'school' | 'project' | 'interest' | 'friend';

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
  spotifyArtistId?: string;
  artists?: { name: string; spotifyArtistId: string }[]; // multiple artists per city
  media?: MediaItem[];
}

interface Friend {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  show_name?: boolean;
  note?: string;
  song?: string;
  animal?: string;
  descriptors?: Record<string, string>;
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
  friend:   '#ffffff', // overridden per-friend
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
  const allLocationsRef = useRef<GlobeLocation[]>(LOCATIONS);
  const navigate = useNavigate();
  const spinRef = useRef<(loc: GlobeLocation) => void>(() => {});

  // Load friends — both as subtle overlay AND as clickable location pins
  useEffect(() => {
    fetch('/api/friends').then(r => r.json()).then((friends: Friend[]) => {
      if (!friends?.length) return;
      // Add as location pins
      const friendPins: GlobeLocation[] = friends.map(f => {
        // Extract just city name for Wikipedia (e.g. "pittsburgh pennsylvania" -> "Pittsburgh")
        const wikiCity = f.city.split(/[,\s]+/)[0];
        return {
          id: `friend-${f.id}`,
          name: f.city,
          lat: f.lat,
          lng: f.lng,
          queryKeywords: `${f.name} ${f.city}`,
          category: 'friend' as Category,
          description: f.name,
          wikiQuery: wikiCity,
          friendData: f,
        } as any;
      });
      setAllLocations(prev => {
        const seen = new Set(prev.map(l => l.id));
        const next = [...prev, ...friendPins.filter(p => !seen.has(p.id))];
        allLocationsRef.current = next;
        return next;
      });
      // Also inject subtle overlay markers
      const tryInject = setInterval(() => {
        if (!globeRef.current) return;
        clearInterval(tryInject);
        injectFriendMarkers(friends);
      }, 200);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/spotify/top-artists').then(r => r.json()).then(data => {
      if (data.pins?.length) {
        setAllLocations(prev => {
          const seen = new Set(prev.map(l => l.id));
          const next = [...prev, ...data.pins.filter((p: GlobeLocation) => !seen.has(p.id))];
          allLocationsRef.current = next;
          return next;
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
    // Always use city wiki query — animal is shown in friend card separately
    const wikiQ = loc.wikiQuery;
    if (wikiQ) {
      const encoded = wikiQ.split(',').map((s: string) => encodeURIComponent(s.trim())).join(',');
      fetch(`/api/wiki?q=${encoded}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setWikiData(d); })
        .catch(() => {});
    } else {
      fetch(`/api/wiki?q=${encodeURIComponent(loc.name)}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setWikiData(d); })
        .catch(() => {});
    }
  }, [onPanelChange]);

  useEffect(() => { spinRef.current = spinToLocation; }, [spinToLocation]);

  // Inject friend markers as htmlElementsData — stored separately, applied after globe init
  const injectFriendMarkers = (friends: Friend[]) => {
    if (!globeRef.current) return;
    // Store friends on globe via custom property for re-use
    (globeRef.current as any).__friends = friends;
    renderFriendOverlay(friends);
  };

  const renderFriendOverlay = (friends: Friend[]) => {
    if (!containerRef.current) return;
    // Remove existing overlay
    const existing = containerRef.current.querySelector('.friendOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'friendOverlay';
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;';
    containerRef.current.appendChild(overlay);

    const updatePositions = () => {
      if (!globeRef.current) return;
      overlay.innerHTML = '';
      friends.forEach((f: Friend) => {
        const projected = globeRef.current.getScreenCoords(f.lat, f.lng, 0.07);
        if (!projected) return;
        const { x, y } = projected;
        if (x < 0 || y < 0) return;

        const color = f.color ?? '#a8d8ea';
        const pin = document.createElement('div');
        pin.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%);pointer-events:all;cursor:pointer;`;
        pin.innerHTML = `
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 4px ${color}88)">
            <circle cx="7" cy="5" r="3.5" fill="${color}" stroke="rgba(0,0,0,0.7)" stroke-width="1"/>
            <path d="M1 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="${color}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          </svg>
          <div class="friendPinTip" style="display:none;position:absolute;bottom:calc(100% + 2px);left:50%;transform:translateX(-50%);background:rgba(8,8,8,0.95);border:1px solid ${color};padding:3px 8px;font-family:'IBM Plex Mono',monospace;font-size:0.65rem;color:#f0f0f0;white-space:nowrap;border-radius:2px;z-index:9999;">${f.city}</div>
        `;
        pin.addEventListener('mouseenter', () => { (pin.querySelector('.friendPinTip') as HTMLElement).style.display = 'block'; });
        pin.addEventListener('mouseleave', () => { (pin.querySelector('.friendPinTip') as HTMLElement).style.display = 'none'; });
        overlay.appendChild(pin);
      });
    };

    // Update on every animation frame
    let animId: number;
    const loop = () => { updatePositions(); animId = requestAnimationFrame(loop); };
    loop();
    // Store cleanup on overlay element
    (overlay as any)._cleanup = () => cancelAnimationFrame(animId);
  };



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
        let hoveredPoint: any = null;
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
          .pointsData(allLocationsRef.current)
          .pointLat((d: any) => d.lat)
          .pointLng((d: any) => d.lng)
          .pointColor((d: any) => d.category === 'friend' ? (d.friendData?.color ?? '#a8d8ea') : (CATEGORY_COLORS[d.category as Category] ?? '#739166'))
          .pointAltitude((d: any) => d.category === 'friend' ? 0.03 : 0.06)
          .pointRadius((d: any) => d.category === 'friend' ? 0.25 : 0.5)
          .pointResolution(12)
          .pointLabel((d: any) => {
            const c = d.category === 'friend' ? (d.friendData?.color ?? '#a8d8ea') : (CATEGORY_COLORS[d.category as Category] ?? '#739166');
            const label = d.category === 'friend' ? d.name : d.name;
            return `<div style="background:rgba(8,8,8,0.95);border:1px solid ${c};padding:5px 9px;font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:#f0f0f0;white-space:nowrap;border-radius:2px;cursor:pointer">${label}</div>`;
          })
          .onPointHover((point: any) => {
            hoveredPoint = point;
            el.style.cursor = point ? 'pointer' : 'default';
          })
          .onPointClick((point: any) => { if (point) spinRef.current(point as GlobeLocation); })
          (el);

        globeRef.current = globe;

        // Fire on hoveredPoint when canvas clicked — tooltip hover area >> raycast area
        el.addEventListener('click', () => {
          if (hoveredPoint) spinRef.current(hoveredPoint as GlobeLocation);
        });
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

  useEffect(() => {
    if (globeRef.current) globeRef.current.pointsData(allLocations);
    else allLocationsRef.current = allLocations; // store for when globe inits
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
            {/* Hero — only shown when wiki image exists */}
            {wikiData?.image ? (
              <div className="wikiHero" style={{ backgroundImage: `url(${wikiData.image})` }}>
                <div className="wikiHeroOverlay" />
                <div className="wikiHeroText">
                  <span className="panelCat" style={{ color: CATEGORY_COLORS[selected.category] }}>[{selected.category}]</span>
                  <h2 className="panelName">{selected.name}</h2>
                  {wikiData.description && <p className="wikiDesc">{wikiData.description}</p>}
                </div>
                <button className="panelClose panelCloseHero" onClick={closePanel}>✕</button>
              </div>
            ) : (
              <div className="panelHeader">
                <div>
                  <span className="panelCat" style={{ color: CATEGORY_COLORS[selected.category] }}>[{selected.category}]</span>
                  <h2 className="panelName">{selected.name}</h2>
                </div>
                <button className="panelClose" onClick={closePanel}>✕</button>
              </div>
            )}

            {selected.siteLink && (
              <button className="panelSiteLink" style={{ margin: '0.75rem 1.75rem 0' }} onClick={() => handleSiteLink(selected.siteLink!)}>
                → {selected.siteLink.label}
              </button>
            )}

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

            {/* FRIENDS section — self-contained friend cards */}
            {(() => {
              const f = (selected as any).friendData as Friend | undefined;
              if (!f) return null;
              return (
                <>
                  <div className="panelDivider" />
                  <div className="panelSection">
                    <p className="panelSectionLabel">people</p>
                    <div className="friendCard" style={{ borderColor: f.color + '55', background: f.color + '08' }}>
                      {/* Header row: icon + label */}
                      <div className="friendCardHeader">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="10" r="6" fill={f.color} opacity="0.9"/>
                          <path d="M2 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={f.color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
                        </svg>
                        <div>
                          <span className="friendCardLabel" style={{ color: f.color }}>Guha's Friend</span>
                          {f.show_name && <span className="friendCardName">{f.name}</span>}
                        </div>
                      </div>

                      {/* Metadata row: animal + note */}
                      <div className="friendCardMeta">
                        {f.animal && (
                          <span className="friendCardTag" style={{ borderColor: f.color + '55', color: f.color }}>
                            🐾 {f.animal.replace(/_/g, ' ')}
                          </span>
                        )}
                        {f.note && <span className="friendCardNote">{f.note}</span>}
                      </div>

                      {/* Song embed */}
                      {f.song && (
                        <iframe
                          src={`https://open.spotify.com/embed/track/${f.song}?utm_source=generator&theme=0`}
                          width="100%" height="80" frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy" style={{ borderRadius: '4px', marginTop: '10px', display: 'block' }}
                        />
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ARTISTS section — Spotify embeds */}
            {(() => {
              const artistItems: MediaItem[] = [
                ...(selected.media ?? []),
                ...(selected.artists?.length && !selected.media
                  ? selected.artists.map(a => ({ type: 'spotify_artist' as const, id: a.spotifyArtistId, label: a.name }))
                  : []),
                ...(!selected.media && !selected.artists?.length && selected.id.startsWith('music-') && !(selected as any).friendData
                  ? [{ type: 'spotify_artist' as const, id: selected.id.replace('music-', ''), label: selected.description }]
                  : []),
              ];
              if (!artistItems.length) return null;
              return (
                <>
                  <div className="panelDivider" />
                  <div className="panelSection">
                    <p className="panelSectionLabel">artists</p>
                    {artistItems.map((item, i) => (
                      <div key={i} className="mediaEmbed">
                        {item.label && <p className="mediaLabel">♫ {item.label}</p>}
                        <iframe
                          src={`https://open.spotify.com/embed/artist/${item.id}?utm_source=generator&theme=0`}
                          width="100%" height="152" frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy" style={{ borderRadius: '6px' }}
                        />
                      </div>
                    ))}
                  </div>
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
