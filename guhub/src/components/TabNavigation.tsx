import { Link, useLocation } from 'react-router-dom';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();

  const tabs = [
    { path: '/', label: 'GU-NIVERSE' },
    { path: '/projects', label: 'PROJECTS' },
    { path: '/about', label: 'RESUMÉ' },
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
