import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { reviews, lists } from '../data/musicReviews';
import type { MusicReview, MusicList } from '../data/musicReviews';
import './MusicPage.css';

type Tab = 'reviews' | 'lists';

const StarRating = ({ n }: { n: number }) => (
  <span className="starRating">
    {'█'.repeat(n)}{'░'.repeat(10 - n)}
    <span className="starNum">{n}/10</span>
  </span>
);

const MusicPage = () => {
  const [tab, setTab] = useState<Tab>('reviews');
  const [openReview, setOpenReview] = useState<MusicReview | null>(null);
  const [openList, setOpenList] = useState<MusicList | null>(null);

  // ── full review ──────────────────────────────────────
  if (openReview) {
    return (
      <div className="musicPage">
        <div className="musicContainer">
          <button className="musicBack" onClick={() => setOpenReview(null)}>← back</button>
          <article className="reviewFull">
            <header className="reviewFullHeader">
              <div className="reviewFullMeta">
                <div className="reviewFullInfo">
                  <h1 className="reviewFullAlbum">{openReview.album}</h1>
                  <p className="reviewFullArtist">{openReview.artist}</p>
                  <p className="reviewFullYear">{openReview.year}</p>
                  <div className="reviewGenres">
                    {openReview.genre.map(g => (
                      <span key={g} className="genreTag">{g}</span>
                    ))}
                  </div>
                </div>
                <StarRating n={openReview.rating} />
              </div>
              {openReview.standouts && (
                <div className="standouts">
                  <span className="standoutsLabel">standouts</span>
                  <span className="standoutsList">{openReview.standouts.join(' · ')}</span>
                </div>
              )}
            </header>
            <div className="reviewBody">
              <ReactMarkdown>{openReview.review}</ReactMarkdown>
            </div>
            {openReview.spotifyUrl && (
              <a href={openReview.spotifyUrl} target="_blank" rel="noopener noreferrer" className="spotifyBtn">
                open on spotify ↗
              </a>
            )}
          </article>
        </div>
      </div>
    );
  }

  // ── full list ────────────────────────────────────────
  if (openList) {
    return (
      <div className="musicPage">
        <div className="musicContainer">
          <button className="musicBack" onClick={() => setOpenList(null)}>← back</button>
          <article className="listFull">
            <header className="listFullHeader">
              <h1 className="listFullTitle">{openList.title}</h1>
              <p className="listFullDesc">{openList.description}</p>
            </header>
            <ol className="listItems">
              {openList.items.map((item, i) => (
                <li key={i} className="listItem">
                  <span className="listNum">{String(i + 1).padStart(2, '0')}</span>
                  <div className="listItemBody">
                    <span className="listItemTitle">{item.title}</span>
                    <span className="listItemArtist">{item.artist}</span>
                    {item.note && <span className="listItemNote">{item.note}</span>}
                  </div>
                  {item.spotifyUrl && (
                    <a href={item.spotifyUrl} target="_blank" rel="noopener noreferrer" className="listSpotify">↗</a>
                  )}
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="musicPage">
      <div className="musicContainer">
        <div className="musicHeader">
          <p className="musicLabel">&gt; music</p>
          <h1 className="musicTitle">listening</h1>
        </div>

        <div className="musicTabs">
          <button className={`musicTab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
            reviews ({reviews.length})
          </button>
          <button className={`musicTab ${tab === 'lists' ? 'active' : ''}`} onClick={() => setTab('lists')}>
            lists ({lists.length})
          </button>
        </div>

        {tab === 'reviews' && (
          <div className="reviewList">
            {reviews.map(r => (
              <button key={r.slug} className="reviewRow" onClick={() => setOpenReview(r)}>
                <div className="reviewRowLeft">
                  <div className="reviewRowMeta">
                    <span className="reviewRowYear">{r.year}</span>
                    <div className="reviewGenres">
                      {r.genre.map(g => <span key={g} className="genreTag">{g}</span>)}
                    </div>
                  </div>
                  <h2 className="reviewRowAlbum">{r.album}</h2>
                  <p className="reviewRowArtist">{r.artist}</p>
                </div>
                <div className="reviewRowRight">
                  <StarRating n={r.rating} />
                  <span className="reviewArrow">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'lists' && (
          <div className="listGrid">
            {lists.map(l => (
              <button key={l.slug} className="listCard" onClick={() => setOpenList(l)}>
                <h2 className="listCardTitle">{l.title}</h2>
                <p className="listCardDesc">{l.description}</p>
                <span className="listCardCount">{l.items.length} items →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPage;
