import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { FaCog, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import ProjectEditor from './ProjectEditor';
import ResumeEditor from './ResumeEditor';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminMode, logout } = useAdmin();
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isAdminMode) return null;

  return (
    <>
      <div className="adminPanel">
        <button
          className="adminPanelToggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Admin Panel"
        >
          <FaCog className={isExpanded ? 'spinning' : ''} />
        </button>

        {isExpanded && (
          <div className="adminPanelMenu">
            <div className="adminPanelHeader">
              <span>Admin Mode</span>
              <button onClick={logout} className="adminLogoutButton" title="Logout">
                <FaSignOutAlt />
              </button>
            </div>

            <button
              className="adminMenuItem"
              onClick={() => {
                setShowProjectEditor(true);
                setIsExpanded(false);
              }}
            >
              <FaEdit />
              <span>Edit Projects</span>
            </button>

            <button
              className="adminMenuItem"
              onClick={() => {
                setShowResumeEditor(true);
                setIsExpanded(false);
              }}
            >
              <FaEdit />
              <span>Edit Resume</span>
            </button>
          </div>
        )}
      </div>

      {showProjectEditor && (
        <ProjectEditor onClose={() => setShowProjectEditor(false)} />
      )}

      {showResumeEditor && (
        <ResumeEditor onClose={() => setShowResumeEditor(false)} />
      )}
    </>
  );
};

export default AdminPanel;
