import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobeSection.css';
import majorCitiesRaw from '../data/majorCities.json';

interface MajorCity { name: string; lat: number; lng: number; country: string; pop: number; }
const MAJOR_CITIES = majorCitiesRaw as MajorCity[];
const CITY_SNAP_RADIUS = 1.5; // degrees (~150km)

function snapToMajorCity(lat: number, lng: number): MajorCity | null {
  // Already sorted by pop desc — first match within radius is the largest city
  for (const city of MAJOR_CITIES) {
    if (Math.hypot(city.lat - lat, city.lng - lng) < CITY_SNAP_RADIUS) return city;
  }
  return null;
}

const ENGRAMME_API = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev/v1/memories/recall';
const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const ARTIST_COLOR = '#a78bfa';

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
  artists?: { name: string; spotifyArtistId: string }[];
  media?: MediaItem[];
  friends?: Friend[];
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

const FriendAnimal = ({ slug, color }: { slug: string; color: string }) => {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/wiki?q=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d.image) setImg(d.image); })
      .catch(() => {});
  }, [slug]);
  return (
    <span className="friendAnimalTag" style={{ borderColor: color + '55', color }}>
      {img && <img src={img} alt={slug} className="friendAnimalImg" />}
      {slug.replace(/_/g, ' ')}
    </span>
  );
};

function findNearestLocation(locations: GlobeLocation[], lat: number, lng: number, radius = CITY_SNAP_RADIUS): GlobeLocation | null {
  let best: GlobeLocation | null = null;
  let bestDist = Infinity;
  for (const loc of locations) {
    const dist = Math.hypot(loc.lat - lat, loc.lng - lng);
    if (dist < radius && dist < bestDist) { best = loc; bestDist = dist; }
  }
  return best;
}

// Returns the existing pin to merge into, or creates a new one snapped to the nearest major city
function getOrCreateCityPin(next: GlobeLocation[], lat: number, lng: number, fallbackName: string): GlobeLocation {
  const existing = findNearestLocation(next, lat, lng);
  if (existing) return existing;

  const major = snapToMajorCity(lat, lng);
  if (major) {
    const id = `city-${major.name.toLowerCase().replace(/\s+/g, '-')}`;
    const alreadyCreated = next.find(l => l.id === id);
    if (alreadyCreated) return alreadyCreated;
    const pin: GlobeLocation = { id, name: major.name, lat: major.lat, lng: major.lng, queryKeywords: `${major.name} ${major.country}`, category: 'interest' as Category, description: major.name, wikiQuery: major.name };
    next.push(pin);
    return pin;
  }

  // No major city nearby — pin at exact coords with fallback name
  const id = `city-${lat.toFixed(2)}-${lng.toFixed(2)}`;
  const alreadyCreated = next.find(l => l.id === id);
  if (alreadyCreated) return alreadyCreated;
  const pin: GlobeLocation = { id, name: fallbackName, lat, lng, queryKeywords: fallbackName, category: 'interest' as Category, description: fallbackName, wikiQuery: fallbackName.split(',')[0].trim() };
  next.push(pin);
  return pin;
}

const FriendCard = ({ friend }: { friend: Friend }) => {
  const color = friend.color ?? '#a8d8ea';
  return (
    <div className="friendCard" style={{ borderLeftColor: color, background: color + '08' }}>
      <div className="friendCardHeader">
        <div className="friendCardIcon" style={{ background: color + '18', borderColor: color + '55' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill={color} />
            <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className="friendCardInfo">
          {friend.show_name && <span className="friendCardName" style={{ color }}>{friend.name}</span>}
          <span className="friendCardLabel" style={{ color: color + '99' }}>{friend.city ? friend.city.split(',')[0] : 'Guha\'s friend'}</span>
        </div>
        <div className="friendCardDot" style={{ background: color, boxShadow: `0 0 7px ${color}` }} />
      </div>
      {(friend.animal || friend.note) && (
        <div className="friendCardMeta">
          {friend.animal && <FriendAnimal slug={friend.animal} color={color} />}
          {friend.note && <span className="friendCardNote">{friend.note}</span>}
        </div>
      )}
      {friend.song && (
        <iframe
          src={`https://open.spotify.com/embed/track/${friend.song}?utm_source=generator&theme=0`}
          width="100%" height="80" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy" style={{ borderRadius: '4px', marginTop: '6px', display: 'block' }}
        />
      )}
    </div>
  );
};

const ArtistCard = ({ name, spotifyArtistId, hometown }: { name: string; spotifyArtistId: string; hometown?: string }) => (
  <div className="artistCard">
    <div className="artistCardHeader">
      <div className="artistCardIcon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={ARTIST_COLOR} strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.5" fill={ARTIST_COLOR} />
          <circle cx="12" cy="12" r="1.2" fill="#0e1a0a" />
        </svg>
      </div>
      <div className="artistCardInfo">
        <span className="artistCardName">{name}</span>
        <span className="artistCardLabel">{hometown ?? 'musician'}</span>
      </div>
      <div className="artistCardDot" />
    </div>
    <iframe
      src={`https://open.spotify.com/embed/artist/${spotifyArtistId}?utm_source=generator&theme=0`}
      width="100%" height="152" frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy" style={{ borderRadius: '6px', marginTop: '6px' }}
    />
  </div>
);

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

  // Load friends — snap to nearest major city or existing location
  useEffect(() => {
    fetch('/api/friends').then(r => r.json()).then((friends: Friend[]) => {
      if (!friends?.length) return;
      setAllLocations(prev => {
        const next = prev.map(l => ({ ...l }));
        for (const f of friends) {
          const pin = getOrCreateCityPin(next, f.lat, f.lng, f.city);
          pin.friends = [...(pin.friends ?? []), f];
        }
        allLocationsRef.current = next;
        return next;
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/spotify/top-artists').then(r => r.json()).then(data => {
      if (!data.pins?.length) return;
      setAllLocations(prev => {
        const next = prev.map(l => ({ ...l }));
        for (const pin of data.pins as GlobeLocation[]) {
          const cityPin = getOrCreateCityPin(next, pin.lat, pin.lng, pin.name);
          // API already groups artists per city — use the array if present
          const entries = pin.artists?.length
            ? pin.artists
            : [{ name: pin.description, spotifyArtistId: pin.spotifyArtistId ?? pin.id.replace('music-', '') }];
          cityPin.artists = [...(cityPin.artists ?? []), ...entries];
        }
        allLocationsRef.current = next;
        return next;
      });
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
          .pointColor(() => '#739166')
          .pointAltitude((d: any) => d.category === 'friend' ? 0.03 : 0.06)
          .pointRadius((d: any) => d.category === 'friend' ? 0.3 : 0.5)
          .pointResolution(12)
          .pointLabel((d: any) => `<div style="background:rgba(8,8,8,0.95);border:1px solid #739166;padding:5px 9px;font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:#f0f0f0;white-space:nowrap;border-radius:2px;cursor:pointer">${d.name}</div>`)
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

            {/* FRIENDS section */}
            {selected.friends?.length ? (
              <>
                <div className="panelDivider" />
                <div className="panelSection">
                  <p className="panelSectionLabel">people</p>
                  {selected.friends.map((f, i) => <FriendCard key={i} friend={f} />)}
                </div>
              </>
            ) : null}

            {/* ARTISTS section */}
            {(() => {
              const artistItems = [
                ...(selected.artists ?? []),
                ...(!selected.artists?.length && selected.id.startsWith('music-')
                  ? [{ name: selected.description, spotifyArtistId: selected.id.replace('music-', '') }]
                  : []),
              ];
              if (!artistItems.length) return null;
              return (
                <>
                  <div className="panelDivider" />
                  <div className="panelSection">
                    <p className="panelSectionLabel">artists</p>
                    {artistItems.map((a, i) => <ArtistCard key={i} name={a.name} spotifyArtistId={a.spotifyArtistId} hometown={(a as any).hometown} />)}
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
