import { Link } from 'react-router-dom';
import './MusicLanding.css';

const MusicLanding = () => {
  return (
    <div className="musicLanding">
      <div className="musicHero">
        <div className="musicHeader">
          <span className="musicLabel">[sound]</span>
          <h1 className="musicTitle">MUSIC GALAXY</h1>
          <p className="musicSubtitle">
            where noise becomes meaning / where taste reveals topology
          </p>
        </div>

        <div className="musicGrid">
          <Link to="/music/1" className="musicCard">
            <div className="cardNumber">01</div>
            <div className="cardContent">
              <h2 className="cardTitle">Top Albums 2024</h2>
              <p className="cardDescription">
                my year in sound: from shoegaze to glitch-slop to whatever the hell parannoul is doing
              </p>
              <div className="cardMeta">
                <span className="cardCount">10 albums</span>
                <span className="cardArrow">→</span>
              </div>
            </div>
          </Link>

          <div className="musicCard wipCard">
            <div className="cardNumber">02</div>
            <div className="cardContent">
              <h2 className="cardTitle">Playlist Archive</h2>
              <p className="cardDescription">
                curated chaos / organized by vibe not genre
              </p>
              <div className="wipTag">coming soon</div>
            </div>
          </div>

          <div className="musicCard wipCard">
            <div className="cardNumber">03</div>
            <div className="cardContent">
              <h2 className="cardTitle">Sound Experiments</h2>
              <p className="cardDescription">
                making noise / breaking things / occasionally creating art
              </p>
              <div className="wipTag">coming soon</div>
            </div>
          </div>
        </div>
      </div>

      <div className="musicFooter">
        <p className="footerQuote">
          "the only truth is music" — jack kerouac (probably too drunk to remember saying it)
        </p>
      </div>
    </div>
  );
};

export default MusicLanding;
