import { useState, useEffect, useRef } from 'react';
import { TearIcon } from '../components/CustomIcons';
import { Link, useParams } from 'react-router-dom';
import { topAlbumsLists, type AlbumListConfig } from '../data/topAlbums';
import './TopTracks.css';

const TopTracks = () => {
  const { id } = useParams<{ id: string }>();
  const config: AlbumListConfig | undefined = topAlbumsLists[id ?? '1'];

  // Carti rank-1 joke state (only used when config.rankOne is set)
  const [showCarti, setShowCarti] = useState(true);
  const [hasSeenJoke, setHasSeenJoke] = useState(false);
  const [cartiVisible, setCartiVisible] = useState(false);
  const cartiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config?.rankOne) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !cartiVisible) {
            setCartiVisible(true);
            setTimeout(() => {
              setShowCarti(false);
              setHasSeenJoke(true);
            }, 3000);
          }
        });
      },
      { threshold: 0.3 },
    );
    if (cartiRef.current) observer.observe(cartiRef.current);
    return () => {
      if (cartiRef.current) observer.unobserve(cartiRef.current);
    };
  }, [cartiVisible, config?.rankOne]);

  if (!config) {
    return (
      <div className="topTracks">
        <div className="tracksHeader">
          <Link to="/music" className="backButton">← back to music</Link>
          <div className="headerContent">
            <span className="headerLabel">[404]</span>
            <h1 className="tracksTitle">NO SUCH LIST</h1>
          </div>
        </div>
      </div>
    );
  }

  const rankOne = config.rankOne;
  // ranks > 1 displayed descending so the top entry sits at the bottom,
  // matching the original 2025 layout. Rank 1 is rendered separately
  // (special if rankOne is set, otherwise plain).
  const otherAlbums = config.albums
    .filter(a => a.rank !== 1)
    .sort((a, b) => b.rank - a.rank);
  const rank1Plain = rankOne ? null : config.albums.find(a => a.rank === 1) ?? null;

  return (
    <div className="topTracks">
      <div className="tracksHeader">
        <Link to="/music" className="backButton">
          ← back to music
        </Link>
        <div className="headerContent">
          <span className="headerLabel">{config.label}</span>
          <h1 className="tracksTitle">{config.title}</h1>
          <p className="tracksSubtitle">{config.subtitle}</p>
        </div>
      </div>

      <div className="albumsList">
        {otherAlbums.map((album) => (
          <div key={album.rank} className="albumCard">
            <div className="rankBadge">
              <span className="rankNumber">{album.rank.toString().padStart(2, '0')}</span>
            </div>
            <div className="albumHeader">
              <h2 className="albumTitle">
                {album.title}
                {album.year && <span className="albumYear">{album.year}</span>}
              </h2>
              <h3 className="artistName">{album.artist}</h3>
            </div>
            {album.review && <p className="albumReview">{album.review}</p>}
            {album.spotifyEmbed && (
              <div className="favTrack">
                <span className="trackLabel">fav track:</span>
                <iframe
                  data-testid="embed-iframe"
                  style={{ borderRadius: '12px' }}
                  src={album.spotifyEmbed}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}

        {/* Rank 1 — either the Carti joke reveal or a plain entry */}
        {rankOne && (
          <div ref={cartiRef} className={`albumCard rankOne ${showCarti ? 'cartiMode' : 'revealed'}`}>
            <div className="rankBadge">
              <span className="rankNumber">01</span>
            </div>
            {showCarti ? (
              <div className="cartiJoke">
                <div className="albumHeader">
                  <h2 className="albumTitle">
                    {rankOne.fake.title}
                    {rankOne.fake.year && <span className="albumYear">{rankOne.fake.year}</span>}
                  </h2>
                  <h3 className="artistName">{rankOne.fake.artist}</h3>
                </div>
                <div className="jokePulse">
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: '12px' }}
                    src={rankOne.fake.spotifyEmbed}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div className="realNumber1">
                {hasSeenJoke && (
                  <div className="jkTag">
                    just kidding <TearIcon size={18} /> <TearIcon size={18} />
                  </div>
                )}
                <div className="albumHeader">
                  <h2 className="albumTitle">
                    {rankOne.real.title}
                    {rankOne.real.year && <span className="albumYear">{rankOne.real.year}</span>}
                  </h2>
                  <h3 className="artistName">{rankOne.real.artist}</h3>
                </div>
                {rankOne.real.review && (
                  <p className="albumReview">{rankOne.real.review}</p>
                )}
                {rankOne.real.spotifyEmbed && (
                  <div className="favTrack">
                    <span className="trackLabel">fav track:</span>
                    <iframe
                      data-testid="embed-iframe"
                      style={{ borderRadius: '12px' }}
                      src={rankOne.real.spotifyEmbed}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {rank1Plain && (
          <div className="albumCard">
            <div className="rankBadge">
              <span className="rankNumber">01</span>
            </div>
            <div className="albumHeader">
              <h2 className="albumTitle">
                {rank1Plain.title}
                {rank1Plain.year && <span className="albumYear">{rank1Plain.year}</span>}
              </h2>
              <h3 className="artistName">{rank1Plain.artist}</h3>
            </div>
            {rank1Plain.review && <p className="albumReview">{rank1Plain.review}</p>}
            {rank1Plain.spotifyEmbed && (
              <div className="favTrack">
                <span className="trackLabel">fav track:</span>
                <iframe
                  data-testid="embed-iframe"
                  style={{ borderRadius: '12px' }}
                  src={rank1Plain.spotifyEmbed}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tracksFooter">
        <p className="footerNote">
          * all opinions subject to change if provided monetary compensation
        </p>
      </div>
    </div>
  );
};

export default TopTracks;
