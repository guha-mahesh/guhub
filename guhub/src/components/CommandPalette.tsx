import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommandPalette.css';

interface Command {
  id: string;
  label: string;
  sublabel?: string;
  action: () => void;
  category: 'navigate' | 'project' | 'contact' | 'misc';
  shortcut?: string;
}

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = [
    // Navigation
    { id: 'nav-home', label: 'Go to GUHA', sublabel: 'brain graph + landing', action: () => navigate('/'), category: 'navigate' },
    { id: 'nav-projects', label: 'Go to Projects', sublabel: 'full project list', action: () => navigate('/projects'), category: 'navigate' },
    { id: 'nav-resume', label: 'Go to Resumé', sublabel: 'education, experience, skills', action: () => navigate('/about'), category: 'navigate' },
    { id: 'nav-music', label: 'Go to Music Galaxy', action: () => navigate('/music'), category: 'navigate' },
    { id: 'nav-philosophy', label: 'Go to Ethics Galaxy', action: () => navigate('/philosophy'), category: 'navigate' },
    { id: 'nav-animals', label: 'Go to Animals Galaxy', action: () => navigate('/animals'), category: 'navigate' },
    { id: 'nav-geography', label: 'Go to Geography Galaxy', action: () => navigate('/geography'), category: 'navigate' },
    { id: 'nav-culture', label: 'Go to Culture Galaxy', action: () => navigate('/culture'), category: 'navigate' },
    { id: 'nav-albums', label: 'Top Albums 2024', action: () => navigate('/music/1'), category: 'navigate' },
    // Projects
    { id: 'proj-bioclock', label: 'BioClock', sublabel: 'CNN · satellite · biodiversity prediction', action: () => window.open('https://github.com/guha-mahesh/BioClock', '_blank'), category: 'project' },
    { id: 'proj-flightscope', label: 'FlightScope', sublabel: 'birdwatching · Poisson models · Flask', action: () => window.open('https://github.com/guha-mahesh/FlightScope', '_blank'), category: 'project' },
    { id: 'proj-clubstop', label: 'ClubStop', sublabel: 'React · TypeScript · MySQL · university clubs', action: () => window.open('https://github.com/guha-mahesh/ClubStop', '_blank'), category: 'project' },
    { id: 'proj-monkroyer', label: 'Monkroyer', sublabel: 'social bingo · leagues · AWS · JWT auth', action: () => window.open('https://github.com/guha-mahesh/monkroyer', '_blank'), category: 'project' },
    { id: 'proj-arbor', label: 'Arbor', sublabel: 'cultural identity network · embeds · friend graphs', action: () => window.open('https://arbor-blue.vercel.app', '_blank'), category: 'project' },
    { id: 'proj-experiencevec', label: 'ExperienceVec', sublabel: 'BERT + phonology · experiential word norms · multi-task', action: () => window.open('https://github.com/guha-mahesh/ExperienceVec', '_blank'), category: 'project' },
    { id: 'proj-meticulous', label: 'Meticulous', sublabel: 'AI Ableton agent · Claude API · OSC · Max for Live', action: () => window.open('https://github.com/guha-mahesh/meticulous', '_blank'), category: 'project' },
    { id: 'proj-policy', label: 'Policy Playground', sublabel: 'regression · financial markets · recommender', action: () => window.open('https://github.com/guha-mahesh/PolicyPlayground', '_blank'), category: 'project' },
    // Contact
    { id: 'contact-email', label: 'Send Email', sublabel: 'guhamaheshv@gmail.com', action: () => window.location.href = 'mailto:guhamaheshv@gmail.com', category: 'contact' },
    { id: 'contact-github', label: 'Open GitHub', sublabel: 'github.com/guha-mahesh', action: () => window.open('https://github.com/guha-mahesh', '_blank'), category: 'contact' },
    { id: 'contact-linkedin', label: 'Open LinkedIn', sublabel: 'linkedin.com/in/guhamahesh', action: () => window.open('https://linkedin.com/in/guhamahesh', '_blank'), category: 'contact' },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const runCommand = useCallback((cmd: Command) => {
    cmd.action();
    close();
  }, [close]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' && filtered[selectedIndex]) { runCommand(filtered[selectedIndex]); return; }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, filtered, selectedIndex, open, close, runCommand]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const categoryLabel: Record<Command['category'], string> = {
    navigate: 'navigation',
    project: 'projects',
    contact: 'contact',
    misc: 'misc',
  };

  // Group by category for display
  const grouped: Record<string, Command[]> = {};
  for (const cmd of filtered) {
    const cat = categoryLabel[cmd.category];
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(cmd);
  }

  let globalIndex = 0;

  if (!isOpen) {
    return (
      <button className="cmdPaletteHint" onClick={open} title="Open command palette (⌘K)">
        <span className="cmdK">⌘K</span>
      </button>
    );
  }

  return (
    <div className="cmdOverlay" onClick={close}>
      <div className="cmdPalette" onClick={e => e.stopPropagation()}>
        <div className="cmdHeader">
          <span className="cmdPrompt">❯</span>
          <input
            ref={inputRef}
            className="cmdInput"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="type a command or search..."
            spellCheck={false}
            autoComplete="off"
          />
          <span className="cmdEsc" onClick={close}>esc</span>
        </div>

        <div className="cmdResults">
          {filtered.length === 0 && (
            <div className="cmdEmpty">no results for "{query}"</div>
          )}
          {Object.entries(grouped).map(([cat, cmds]) => (
            <div key={cat} className="cmdGroup">
              <div className="cmdGroupLabel">{cat}</div>
              {cmds.map(cmd => {
                const idx = globalIndex++;
                return (
                  <button
                    key={cmd.id}
                    className={`cmdItem ${idx === selectedIndex ? 'selected' : ''}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => runCommand(cmd)}
                  >
                    <span className="cmdItemLabel">{cmd.label}</span>
                    {cmd.sublabel && <span className="cmdItemSub">{cmd.sublabel}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="cmdFooter">
          <span className="cmdHint">↑↓ navigate</span>
          <span className="cmdHint">↵ select</span>
          <span className="cmdHint">esc close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
