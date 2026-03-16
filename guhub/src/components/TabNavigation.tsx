import { Link, useLocation } from 'react-router-dom';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();

  const tabs = [
    { path: '/',          label: 'guha of-sorts' },
    { path: '/projects',  label: 'PROJECTS'   },
    { path: '/about',     label: 'RÉSUMÉ'     },
    { path: '/blog',      label: 'BLOG'       },
    { path: '/listening', label: 'LISTENING'  },
  ];

  return (
    <nav className="tabNavigation">
      <div className="tabContainer">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
