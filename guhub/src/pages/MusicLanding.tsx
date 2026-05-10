import { Link } from 'react-router-dom';
import './MusicLanding.css';

const MusicLanding = () => {
  return (
    <div className="musicLanding">
      <div className="musicHero">
        <div className="musicHeader">
          <span className="musicLabel">[sound]</span>
          <h1 className="musicTitle">music of-sorts</h1>
        </div>

        <div className="musicGrid">
          <Link to="/music/1" className="musicCard">
            <div className="cardNumber">01</div>
            <div className="cardContent">
              <h2 className="cardTitle">Top Albums 2025</h2>
              <p className="cardDescription">my year in sound</p>
              <div className="cardMeta">
                <span className="cardCount">10 albums</span>
                <span className="cardArrow">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MusicLanding;
