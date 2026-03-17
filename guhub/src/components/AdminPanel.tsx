import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { FaSignOutAlt, FaUserFriends } from 'react-icons/fa';
import FriendEditor from './FriendEditor';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminMode, logout } = useAdmin();
  const [showFriends, setShowFriends] = useState(false);

  if (!isAdminMode) return null;

  return (
    <>
      <div className="adminPanel">
        <button className="adminPanelToggle" onClick={() => setShowFriends(v => !v)} title="Manage friends">
          <FaUserFriends />
        </button>
        <button className="adminPanelToggle" onClick={logout} title="Exit admin mode">
          <FaSignOutAlt />
        </button>
      </div>

      {showFriends && (
        <div className="friendEditorPanel">
          <FriendEditor />
        </div>
      )}
    </>
  );
};

export default AdminPanel;
