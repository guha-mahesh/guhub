import { Link, useLocation } from 'react-router-dom';
import { useCrenshaw } from '../contexts/CrenshawContext';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();
  const { currentRoute: crenshawRoute } = useCrenshaw();

  const tabs = [
    { path: '/',          label: 'guha of-sorts',     short: 'guha'      },
    { path: '/projects',  label: 'projects of-sorts', short: 'projects'  },
    { path: '/about',     label: 'resume of-sorts',   short: 'resume'    },
    { path: '/log',       label: 'log of-sorts',      short: 'log'       },
    { path: '/listening', label: 'listening of-sorts',short: 'listening' },
  ];

  return (
    <nav className="tabNavigation">
      <div className="tabContainer">
        {tabs.map((tab) => {
          // show the crenshaw notification when he's hiding on this tab AND
          // the user isn't already viewing it (no point hinting at the page they're on)
          const hasCrenshaw = tab.path === crenshawRoute && tab.path !== location.pathname;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab ${location.pathname === tab.path ? 'active' : ''}`}
            >
              <span className="tabFull">{tab.label}</span>
              <span className="tabShort">{tab.short}</span>
              {hasCrenshaw && <span className="crenshawBadge" aria-label="crenshaw is here" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;
