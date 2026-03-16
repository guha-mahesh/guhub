import { Link, useLocation } from 'react-router-dom';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();

  const tabs = [
    { path: '/',          label: 'guha of-sorts',     short: 'guha'      },
    { path: '/projects',  label: 'projects of-sorts', short: 'projects'  },
    { path: '/about',     label: 'resume of-sorts',   short: 'resume'    },
    { path: '/blog',      label: 'blog of-sorts',     short: 'blog'      },
    { path: '/listening', label: 'listening of-sorts',short: 'listening' },
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
            <span className="tabFull">{tab.label}</span>
            <span className="tabShort">{tab.short}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
