import { Link, useLocation } from 'react-router-dom';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();

  const tabs = [
    { path: '/',          label: 'guha of-sorts'     },
    { path: '/projects',  label: 'projects of-sorts' },
    { path: '/about',     label: 'resume of-sorts'   },
    { path: '/blog',      label: 'blog of-sorts'     },
    { path: '/listening', label: 'listening of-sorts'},
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
