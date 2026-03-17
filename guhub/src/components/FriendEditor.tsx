import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './FriendEditor.css';

interface Friend {
  id?: string;
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

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: { city?: string; town?: string; country?: string };
}

const PRESET_COLORS = [
  '#f4a4b8','#f7c59f','#a8d8ea','#b8f0b8','#d4b8f0',
  '#f0e6b8','#b8e6f0','#f0b8d4','#c8f0a8','#f0d4a8',
];

const ADMIN_KEY = 'Crescent1!';

export default function FriendEditor() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [editing, setEditing] = useState<Friend | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => { loadFriends(); }, []);

  const loadFriends = async () => {
    const r = await fetch('/api/friends');
    setFriends(await r.json());
  };

  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);

  const geocodeCity = async (city: string) => {
    setGeocoding(true);
    setGeoResults([]);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'guha.one/1.0' } }
      );
      const d: GeoResult[] = await r.json();
      setGeoResults(d);
      // Auto-select first result
      if (d[0]) setEditing(prev => prev ? { ...prev, lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) } : null);
    } finally { setGeocoding(false); }
  };

  const save = async () => {
    if (!editing) return;
    const method = isNew ? 'POST' : 'PUT';
    await fetch('/api/friends', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    loadFriends();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this friend?')) return;
    await fetch(`/api/friends?id=${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_KEY } });
    loadFriends();
  };

  const blank = (): Friend => ({ name: '', city: '', lat: 0, lng: 0, color: PRESET_COLORS[0], note: '', song: '', animal: '', show_name: false });

  return (
    <div className="friendEditor">
      <div className="friendEditorHeader">
        <span className="friendEditorTitle">friends</span>
        <button className="friendAddBtn" onClick={() => { setEditing(blank()); setIsNew(true); }}>+ add</button>
      </div>

      <div className="friendList">
        {friends.map(f => (
          <div key={f.id} className="friendRow">
            <span className="friendDot" style={{ background: f.color }} />
            <span className="friendRowName">{f.name}</span>
            <span className="friendRowCity">{f.city}</span>
            <button className="friendEditBtn" onClick={() => { setEditing({ ...f }); setIsNew(false); }}>edit</button>
            <button className="friendDeleteBtn" onClick={() => remove(f.id!)}>×</button>
          </div>
        ))}
        {!friends.length && <p className="friendEmpty">no friends yet :(</p>}
      </div>

      {editing && createPortal(
        <div className="friendModal">
          <div className="friendModalBox">
            <h3>{isNew ? 'add friend' : 'edit friend'}</h3>

            <label>name</label>
            <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="name" />

            <label>city</label>
            <div className="friendCityRow">
              <input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} placeholder="city, country" />
              <button onClick={() => geocodeCity(editing.city)} disabled={geocoding}>{geocoding ? '…' : 'locate'}</button>
            </div>
            {/* Geo results picker */}
            {geoResults.length > 0 && (
              <div className="geoResults">
                {geoResults.map((g, i) => (
                  <button key={i} className={`geoResult ${editing.lat === parseFloat(g.lat) ? 'active' : ''}`}
                    onClick={() => setEditing(prev => prev ? { ...prev, lat: parseFloat(g.lat), lng: parseFloat(g.lon) } : null)}>
                    <span className="geoResultName">{g.display_name.split(',').slice(0, 3).join(',')}</span>
                    <span className="geoResultType">{g.type}</span>
                  </button>
                ))}
              </div>
            )}
            {editing.lat !== 0 && <p className="friendCoords">{editing.lat.toFixed(4)}, {editing.lng.toFixed(4)}</p>}

            <label>color</label>
            <div className="friendColorRow">
              {PRESET_COLORS.map(c => (
                <button key={c} className={`friendColorSwatch ${editing.color === c ? 'active' : ''}`}
                  style={{ background: c }} onClick={() => setEditing({ ...editing, color: c })} />
              ))}
              <input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="friendColorPicker" />
            </div>

            <label>note <span className="optional">(optional)</span></label>
            <input value={editing.note ?? ''} onChange={e => setEditing({ ...editing, note: e.target.value })} placeholder="how you know them, vibes, etc." />

            <label>song <span className="optional">(spotify track id — optional)</span></label>
            <input value={editing.song ?? ''} onChange={e => setEditing({ ...editing, song: e.target.value })} placeholder="e.g. 4uLU6hMCjMI75M1A2tKUQC" />

            <label>animal <span className="optional">(wikipedia slug — optional)</span></label>
            <input value={editing.animal ?? ''} onChange={e => setEditing({ ...editing, animal: e.target.value })} placeholder="e.g. Snow_leopard" />

            <div className="friendToggleRow">
              <label className="friendToggle">
                <input type="checkbox" checked={!!editing.show_name}
                  onChange={e => setEditing({ ...editing, show_name: e.target.checked })} />
                <span>show name publicly</span>
              </label>
            </div>

            <div className="friendModalActions">
              <button className="friendSaveBtn" onClick={save}>save</button>
              <button className="friendCancelBtn" onClick={() => setEditing(null)}>cancel</button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
