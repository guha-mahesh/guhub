import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './TopTracks.css';

const TopTracks = () => {
  const [showCarti, setShowCarti] = useState(true);
  const [hasSeenJoke, setHasSeenJoke] = useState(false);
  const [cartiVisible, setCartiVisible] = useState(false);
  const cartiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !cartiVisible) {
            setCartiVisible(true);
            // Show Carti joke for 3 seconds after it becomes visible
            setTimeout(() => {
              setShowCarti(false);
              setHasSeenJoke(true);
            }, 3000);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (cartiRef.current) {
      observer.observe(cartiRef.current);
    }

    return () => {
      if (cartiRef.current) {
        observer.unobserve(cartiRef.current);
      }
    };
  }, [cartiVisible]);

  const albums = [
    {
      rank: 10,
      title: "Luminiscent Creatures",
      artist: "Ichiko Aoba",
      review: "This was perhaps the first new album I listened to this year. I'm not hugely into Japanese music, so this was a great change of pace. Overall, I thought it did the slow relaxed occasionally intense vibes really well! IMO not much to say other than that, but I liked it a lot!",
      spotifyEmbed: "https://open.spotify.com/embed/track/4CkOPXeYKLjeofRoDLIrPF?utm_source=generator"
    },
    {
      rank: 9,
      title: "Getting Killed",
      artist: "Geese",
      review: "I feel there's always a competition between pretentious people trying to remake older music and pretentious people making overproduced 21st century glitch-slop. I'm usually a huge proponent of the latter (for example, I despised Geordie Greep while glazing tf out of Imaginal Disk). Though I have glitch-slop above this album later on in this list, Geese did a great job with this album that I was so reluctant to like. Everyone IK was going crazy about this, so I went in with a closed mind and still liked it quite a bit which is a testament to its quality.",
      spotifyEmbed: "https://open.spotify.com/embed/track/1g9GiiPPaL7KcDHlDzu7lT?utm_source=generator"
    },
    {
      rank: 8,
      title: "Apiary",
      artist: "Gingerbee",
      review: "Some sort of midwest emo mixed with samba and screamo. I really like the way they combine screaming with 8-bit and jazz. Only criticism is how boring some of the songs get and that it's also relatively short. Still great!",
      spotifyEmbed: "https://open.spotify.com/embed/track/5JaWbRRqylF6OeBHlLymla?utm_source=generator"
    },
    {
      rank: 7,
      title: "Ghostholding",
      artist: "Venturing",
      review: "Didn't think I'd have the same artist on here twice (spoiler alert). This is Jane remover's other project which i was extremely fond of. I didn't realize how much I liked her voice when it's not being distorted like crazy. Though this album has nothing novel about it, I overall think this is one of my favorite minimalist albums to date as I'm usually such a huge fan of overproduction.",
      spotifyEmbed: "https://open.spotify.com/embed/track/4NGKKYlXp4jRVJrV3gdOma?utm_source=generator"
    },
    {
      rank: 6,
      title: "K1",
      artist: "Kmoe",
      review: "Another spoiler- the next 3 artists are extremely similar, but I guess that's just where my taste is this year. KMOE is a relatively new artist & I love his whiny ass voice. Idk overall the pros and distortion in general is awesome though not super original. He sounds great!",
      spotifyEmbed: "https://open.spotify.com/embed/track/6joVOYeKHWl5g744BuB3dg?utm_source=generator"
    },
    {
      rank: 5,
      title: "Revengeseekerz",
      artist: "Jane remover",
      review: "I was CONFIDENT this would be my AOTY when i was listening to it when it came out. It's genuinely insane how good this album is & it's prolly her best. JRJRJR is lowkey one of the best rage songs ever made icel.",
      spotifyEmbed: "https://open.spotify.com/embed/track/2AjTT2CBthpsIQtyxzhSr4?utm_source=generator"
    },
    {
      rank: 4,
      title: "Vanisher, horizon scraper",
      artist: "Quadeca",
      review: "Lowkey feel gross liking ts cus Quadeca is goated but popular amongst smellier folks. I was so ready to dislike this album when it came out but MAN Quadeca is on a crazy run. Scrapyard was good but this album is insane. Good for him.",
      spotifyEmbed: "https://open.spotify.com/embed/track/7tJ8jCSe5XPIkRluGfZTu3?utm_source=generator"
    },
    {
      rank: 3,
      title: "I love my computer",
      artist: "ninajirachi",
      review: "Hooooooooly peak this album is so so good thank u for the put on William 1!1! This album is sosososososos good and some of the best prod I've seen in a while. Nina is locked tf in and I genuinely think she has the potential to make a crazy t10 album in the future. All of this is coming from someone who also didn't even listen to the album more than maybe 3x lmao",
      spotifyEmbed: "https://open.spotify.com/embed/track/5ZbztTcvj6QWWbeYsL4GTa?utm_source=generator"
    },
    {
      rank: 2,
      title: "Cowards",
      artist: "Squid",
      review: "This album is lowk the only one here that isn't rated crazily on RYM & i'm not too sure why. I found this album from an instagram reel unrelated to music (it was just using a song from the album in the background) and checked it out. What you need to take away from this ranking is Squid > Geese > Swans. I love the lead singers voice soooo much and overall it's just such an interesting sound & concept.",
      spotifyEmbed: "https://open.spotify.com/embed/track/6vM4E6mvhdKC5e4lR2tm40?utm_source=generator"
    }
  ];

  return (
    <div className="topTracks">
      <div className="tracksHeader">
        <Link to="/music" className="backButton">
          ← back to music galaxy
        </Link>
        <div className="headerContent">
          <span className="headerLabel">[2024 in review]</span>
          <h1 className="tracksTitle">TOP ALBUMS</h1>
          <p className="tracksSubtitle">
            ranked by vibes not objectivity

          </p>
        </div>
      </div>

      <div className="albumsList">
        {/* Albums 10-2 (descending order) */}
        {[...albums].sort((a, b) => b.rank - a.rank).map((album) => (
          <div key={album.rank} className="albumCard">
            <div className="rankBadge">
              <span className="rankNumber">{album.rank.toString().padStart(2, '0')}</span>
            </div>
            <div className="albumHeader">
              <h2 className="albumTitle">{album.title}</h2>
              <h3 className="artistName">{album.artist}</h3>
            </div>
            <p className="albumReview">{album.review}</p>
            <div className="favTrack">
              <span className="trackLabel">fav track:</span>
              <iframe
                data-testid="embed-iframe"
                style={{borderRadius: '12px'}}
                src={album.spotifyEmbed}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        ))}

        {/* #1 Spot with Carti Joke - AT THE BOTTOM */}
        <div ref={cartiRef} className={`albumCard rankOne ${showCarti ? 'cartiMode' : 'revealed'}`}>
          <div className="rankBadge">
            <span className="rankNumber">01</span>
          </div>

          {showCarti ? (
            <div className="cartiJoke">
              <div className="albumHeader">
                <h2 className="albumTitle">MUSIC</h2>
                <h3 className="artistName">Playboi Carti</h3>
              </div>
              <div className="jokePulse">
                <iframe
                  data-testid="embed-iframe"
                  style={{borderRadius: '12px'}}
                  src="https://open.spotify.com/embed/album/0fSfkmx0tdPqFYkJuNX74a?utm_source=generator"
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
                    just kidding  🥹 🥹
                </div>
              )}
              <div className="albumHeader">
                <h2 className="albumTitle">Seeking Darkness</h2>
                <h3 className="artistName">Huremic</h3>
              </div>
              <p className="albumReview">
                This album wasn't even out on Spotify till like October. Huremic is parannoul's side project and it's lowk already in my t15 albums. Ts is soooo good bro part 1 & 2 are great but 3 Is the best noise rock which melds into some bells & nice guitar shit holy ppeeeeeak this album is one of my favs ever thank u Parannoul
              </p>
              <div className="favTrack">
                <span className="trackLabel">fav track:</span>
                <iframe
                  data-testid="embed-iframe"
                  style={{borderRadius: '12px'}}
                  src="https://open.spotify.com/embed/track/6w0Sd0PN2MoweS770BzgkM?utm_source=generator"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
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
