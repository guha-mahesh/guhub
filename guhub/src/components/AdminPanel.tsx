import { useAdmin } from '../contexts/AdminContext';
import { FaSignOutAlt } from 'react-icons/fa';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminMode, logout } = useAdmin();

  if (!isAdminMode) return null;

  return (
    <div className="adminPanel">
      <button className="adminPanelToggle" onClick={logout} title="Exit admin mode">
        <FaSignOutAlt />
      </button>
    </div>
  );
};

export default AdminPanel;
