import { Link, useLocation } from 'react-router-dom';
import { useCrenshaw } from '../contexts/CrenshawContext';
import { useMeta, metaLabel } from '../contexts/MetaContext';
import { useIsMobile } from '../hooks/useIsMobile';
import './TabNavigation.css';

const BASE_TABS = [
  { path: '/',          short: 'guha',      base: 'guha'      },
  { path: '/projects',  short: 'projects',  base: 'projects'  },
  { path: '/about',     short: 'resume',    base: 'resume'    },
  { path: '/log',       short: 'log',       base: 'log'       },
  { path: '/listening', short: 'listening', base: 'listening' },
];

const TabNavigation = () => {
  const location = useLocation();
  const { currentRoute: crenshawRoute } = useCrenshaw();
  const { level, crenshawFreed, optedOut } = useMeta();
  const isMobile = useIsMobile();
  const prefix = level > 0 ? metaLabel(level).toLowerCase() + ' ' : '';

  return (
    <nav className="tabNavigation">
      <div className="tabContainer">
        {BASE_TABS.map((tab) => {
          const hasCrenshaw = !crenshawFreed && !optedOut && !isMobile && tab.path === crenshawRoute && tab.path !== location.pathname;
          const label = `${prefix}${tab.base}`;
          const shortLabel = `${prefix}${tab.short}`;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab ${location.pathname === tab.path ? 'active' : ''}`}
            >
              <span className="tabFull">{label}</span>
              <span className="tabShort">{shortLabel}</span>
              {hasCrenshaw && <span className="crenshawBadge" aria-label="crenshaw is here" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;
