import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { FaSignOutAlt, FaUserFriends, FaMusic } from 'react-icons/fa';
import FriendEditor from './FriendEditor';
import ArtistEditor from './ArtistEditor';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminMode, logout } = useAdmin();
  const [showFriends, setShowFriends] = useState(false);
  const [showArtists, setShowArtists] = useState(false);

  if (!isAdminMode) return null;

  return (
    <>
      <div className="adminPanel">
        <button className="adminPanelToggle" onClick={() => { setShowFriends(v => !v); setShowArtists(false); }} title="Manage friends">
          <FaUserFriends />
        </button>
        <button className="adminPanelToggle" onClick={() => { setShowArtists(v => !v); setShowFriends(false); }} title="Manage musicians">
          <FaMusic />
        </button>
        <button className="adminPanelToggle" onClick={logout} title="Exit admin mode">
          <FaSignOutAlt />
        </button>
      </div>

      {showFriends && (
        <div className="friendEditorPanel">
          <button className="friendEditorPanelClose" onClick={() => setShowFriends(false)}>✕</button>
          <FriendEditor />
        </div>
      )}

      {showArtists && (
        <div className="friendEditorPanel">
          <button className="friendEditorPanelClose" onClick={() => setShowArtists(false)}>✕</button>
          <ArtistEditor />
        </div>
      )}
    </>
  );
};

export default AdminPanel;
