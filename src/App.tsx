/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  Folder, 
  Settings, 
  Mail, 
  Globe, 
  Terminal, 
  Music, 
  Image as ImageIcon,
  Search,
  Power,
  User,
  LayoutGrid,
  X,
  Minus,
  Maximize2,
  Wifi,
  WifiOff,
  Loader2,
  ChevronLeft,
  Code,
  Play,
  FileCode,
  ChevronRight,
  ChevronDown,
  File,
  Edit,
  MousePointer2
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface VFSFile {
  name: string;
  permissions: string;
  isExecutable: boolean;
  type: 'file' | 'dir';
  content?: string;
  isGUI?: boolean;
  appId?: string;
  size?: number;
}

interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  content?: React.ReactNode;
  snapMode: 'none' | 'left' | 'right' | 'full';
  defaultSize?: { width: string; height: string };
}

interface DesktopIconProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DesktopIcon = ({ label, icon, onClick }: DesktopIconProps) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      onClick={onClick}
      className="flex flex-col items-center justify-center w-24 h-24 cursor-pointer group rounded-lg hover:bg-white/10 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/20 transition-colors shadow-lg">
        {icon}
      </div>
      <span className="mt-2 text-xs font-medium text-white drop-shadow-md text-center px-1">
        {label}
      </span>
    </motion.div>
  );
};

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onSnap: (mode: 'none' | 'left' | 'right' | 'full') => void;
  children?: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ 
  window, 
  onClose, 
  onMinimize, 
  onFocus,
  onSnap,
  children 
}) => {
  if (!window.isOpen || window.isMinimized) return null;

  const getSnapStyles = () => {
    switch (window.snapMode) {
      case 'left':
        return {
          top: 0,
          left: 0,
          width: '50%',
          height: 'calc(100vh - 3.5rem)',
          borderRadius: 0,
        };
      case 'right':
        return {
          top: 0,
          right: 0,
          left: 'auto',
          width: '50%',
          height: 'calc(100vh - 3.5rem)',
          borderRadius: 0,
        };
      case 'full':
        return {
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100vh - 3.5rem)',
          borderRadius: 0,
        };
      default:
        return {
          top: '5rem',
          left: '5rem',
          width: window.defaultSize?.width || '600px',
          height: window.defaultSize?.height || '400px',
          borderRadius: '0.75rem',
        };
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        ...getSnapStyles()
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      drag={window.snapMode === 'none'}
      dragMomentum={false}
      dragHandleClassName="window-header"
      onMouseDown={onFocus}
      onDrag={(e, info) => {
        if (window.snapMode !== 'none') return;
        const x = info.point.x;
        const y = info.point.y;
        
        if (y < 20) {
          // Visual hint could go here
        }
      }}
      onDragEnd={(e, info) => {
        const x = info.point.x;
        const y = info.point.y;
        const width = window.innerWidth;

        if (y < 50) {
          onSnap('full');
        } else if (x < 50) {
          onSnap('left');
        } else if (x > window.innerWidth - 50) {
          onSnap('right');
        } else {
          onSnap('none');
        }
      }}
      style={{ zIndex: window.zIndex }}
      className={`absolute glass overflow-hidden flex flex-col shadow-2xl transition-shadow ${window.snapMode !== 'none' ? 'shadow-none' : ''}`}
    >
      <div className="window-header h-10 glass-dark flex items-center justify-between px-4 cursor-move select-none shrink-0">
        <div 
          className="flex items-center gap-2 flex-1 h-full"
          onDoubleClick={() => onSnap(window.snapMode === 'full' ? 'none' : 'full')}
        >
          {window.icon}
          <span className="text-sm font-medium">{window.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onSnap(window.snapMode === 'full' ? 'none' : 'full'); }}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-red-500/50 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {window.snapMode !== 'none' && (
        <div 
          className="h-1 w-full cursor-ns-resize absolute top-0 z-50" 
          onMouseDown={() => onSnap('none')}
        />
      )}
      <div className="flex-1 p-6 overflow-auto bg-black/10">
        {children}
      </div>
      
      {/* Resizer Handle (Visual) */}
      {window.snapMode === 'none' && (
        <div className="absolute bottom-1 right-1 w-3 h-3 cursor-nwse-resize opacity-20 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-r border-b border-white" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-r border-b border-white opacity-50" />
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['Welcome to GlassOS Terminal v1.0.0', 'Type "help" for a list of commands.']);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTopMode, setIsTopMode] = useState(false);
  const [topData, setTopData] = useState([
    { pid: 1, process: 'System', cpu: 0.1, mem: 1.2 },
    { pid: 24, process: 'Window Manager', cpu: 2.4, mem: 4.8 },
    { pid: 102, process: 'Terminal', cpu: 0.5, mem: 0.8 },
    { pid: 312, process: 'Browser', cpu: 8.2, mem: 12.4 },
    { pid: 45, process: 'Network Service', cpu: 0.2, mem: 0.5 },
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
  const [settingsView, setSettingsView] = useState<string>('main');
  const [connectedNetwork, setConnectedNetwork] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [vfs, setVfs] = useState<{ [path: string]: VFSFile }>({
    '/bin': { name: 'bin', permissions: 'drwxr-xr-x', isExecutable: false, type: 'dir' },
    '/home': { name: 'home', permissions: 'drwxr-xr-x', isExecutable: false, type: 'dir' },
    '/home/guest': { name: 'guest', permissions: 'drwxr-xr-x', isExecutable: false, type: 'dir' },
    '/home/guest/secret.txt': { name: 'secret.txt', permissions: '-rw-r--r--', isExecutable: false, type: 'file', content: 'The password to the glass vault is: "G1ass_0S_2026"', size: 54 },
    '/home/guest/projects': { name: 'projects', permissions: 'drwxr-xr-x', isExecutable: false, type: 'dir' },
    '/home/guest/configs': { name: 'configs', permissions: 'drwxr-xr-x', isExecutable: false, type: 'dir' },
  });
  const [currentDir, setCurrentDir] = useState('/home/guest');

  const addToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

  const wallpapers = [
    { id: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', name: 'Abstract Blue' },
    { id: 'mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', name: 'Mountain Peak' },
    { id: 'space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', name: 'Deep Space' },
    { id: 'forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', name: 'Sunlit Forest' }
  ];

  const networks = [
    'Home_Network_5G',
    'CoffeeShop_Free_WiFi',
    'GlassOS_Secure_Net',
    'Public_Library_Guest'
  ];

  const [windows, setWindows] = useState<WindowState[]>([
    { 
      id: 'files', 
      title: 'File Explorer', 
      icon: <Folder size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: null
    },
    { 
      id: 'browser', 
      title: 'Web Browser', 
      icon: <Globe size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-black/20 rounded px-3 py-1 text-xs text-white/50">https://glass-os.sim</div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-2">Glass Search</h2>
            <div className="w-full max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 text-sm" placeholder="Search the web..." />
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'settings', 
      title: 'Settings', 
      icon: <Settings size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 glass-dark rounded-xl">
            <button 
              onClick={() => handleLogout()}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer group relative"
              title="Click to Logout"
            >
              <User size={24} />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Power size={14} className="text-white" />
              </div>
            </button>
            <div className="flex-1">
              {isEditingName ? (
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setUserName(tempName);
                      setIsEditingName(false);
                    } else if (e.key === 'Escape') {
                      setTempName(userName);
                      setIsEditingName(false);
                    }
                  }}
                  onBlur={() => {
                    setUserName(tempName);
                    setIsEditingName(false);
                  }}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <h3 
                  className="font-medium cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                >
                  {userName}
                </h3>
              )}
              <p className="text-xs text-white/50">Local Account</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['System', 'Devices', 'Network', 'Personalization', 'Apps', 'Privacy'].map(item => (
              <div key={item} className="p-3 glass-dark rounded-lg hover:bg-white/10 cursor-pointer flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-md"><Settings size={16} /></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    { 
      id: 'terminal', 
      title: 'Terminal', 
      icon: <Terminal size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: null
    },
    { 
      id: 'music', 
      title: 'Music Player', 
      icon: <Music size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 shadow-2xl flex items-center justify-center">
            <Music size={64} className="text-white/80" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Glass Symphony</h3>
            <p className="text-sm text-white/50">Ambient Dreams</p>
          </div>
          <div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-pink-500" />
          </div>
          <div className="flex items-center gap-8">
            <button className="text-white/60 hover:text-white transition-colors"><LayoutGrid size={20} /></button>
            <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"><LayoutGrid size={24} /></button>
            <button className="text-white/60 hover:text-white transition-colors"><LayoutGrid size={20} /></button>
          </div>
        </div>
      )
    },
    { 
      id: 'photos', 
      title: 'Photos', 
      icon: <ImageIcon size={18} />, 
      isOpen: false, 
      isMinimized: false, 
      zIndex: 10,
      snapMode: 'none',
      content: (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden glass-dark hover:scale-[1.02] transition-transform cursor-pointer">
              <img 
                src={`https://picsum.photos/seed/glass${i}/300/300`} 
                alt={`Photo ${i}`} 
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'codestudio',
      title: 'Code Studio - main.b',
      icon: <Code size={18} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      snapMode: 'none',
      defaultSize: { width: '900px', height: '600px' },
      content: null
    },
    {
      id: 'calculator',
      title: 'Calculator',
      icon: <LayoutGrid size={18} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      snapMode: 'none',
      content: (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          <div className="col-span-4 bg-black/20 p-4 rounded-lg text-right text-2xl font-mono mb-2">0</div>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', 'C', '=', '+'].map(btn => (
            <button key={btn} className="p-4 glass-dark rounded-lg hover:bg-white/10 transition-colors font-bold">{btn}</button>
          ))}
        </div>
      )
    },
  ]);
  const [maxZIndex, setMaxZIndex] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  useEffect(() => {
    if (!isTopMode) return;

    const interval = setInterval(() => {
      setTopData(prev => prev.map(p => ({
        ...p,
        cpu: Math.max(0.1, parseFloat((p.cpu + (Math.random() * 2 - 1)).toFixed(1))),
        mem: Math.max(0.1, parseFloat((p.mem + (Math.random() * 0.4 - 0.2)).toFixed(1))),
      })));
    }, 1000);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') {
        setIsTopMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isTopMode]);

  const toggleWindow = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const newState = { ...w, isOpen: true, isMinimized: false, snapMode: 'none', zIndex: maxZIndex + 1 };
        setMaxZIndex(maxZIndex + 1);
        // Reset settings view when opening
        if (id === 'settings') setSettingsView('main');
        return newState;
      }
      return w;
    }));
    setIsStartOpen(false);
  };

  const installPackage = (name: string) => {
    const pkgFile = `${name}.bbin`;
    const path = `/bin/${pkgFile}`;
    
    let progress = 0;
    setTerminalHistory(prev => [...prev, `Downloading ${pkgFile}...`]);

    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        const bar = '='.repeat(progress / 5) + ' '.repeat(20 - progress / 5);
        setTerminalHistory(prev => {
          const next = [...prev];
          next[next.length - 1] = `[${bar}] ${progress}%`;
          return next;
        });
      } else {
        clearInterval(interval);
        setTerminalHistory(prev => [
          ...prev,
          `Unpacking ${pkgFile}...`,
          `Mapping .text section to 0x00400000`,
          `Mapping .data section to 0x00600000`,
          `Successfully installed ${name} to /bin/`,
        ]);
        setVfs(prev => ({
          ...prev,
          [path]: {
            name: pkgFile,
            permissions: '-rwxr-xr-x',
            isExecutable: true,
            type: 'file',
            isGUI: ['browser', 'calculator', 'photos', 'music', 'settings', 'codestudio'].includes(name.toLowerCase()),
            appId: name.toLowerCase(),
            size: 1024 * 1024 * 2 // 2MB fake size
          }
        }));
      }
    }, 200);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const newState = { ...w, zIndex: maxZIndex + 1 };
        setMaxZIndex(maxZIndex + 1);
        return newState;
      }
      return w;
    }));
  };

  const handleSnap = (id: string, mode: 'none' | 'left' | 'right' | 'full') => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, snapMode: mode } : w));
  };

  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const args = trimmedCmd.split(' ');
    const command = args[0].toLowerCase();
    const newHistory = [...terminalHistory, `guest@glass-os:~$ ${cmd}`];
    
    if (isElectron) {
      try {
        const fs = window.require('fs');
        const path = window.require('path');
        const os = window.require('os');

        if (command === 'ls') {
          const dir = args[1] || '.';
          const files = fs.readdirSync(dir);
          newHistory.push(files.join('  '));
          setTerminalHistory(newHistory);
          return;
        } else if (command === 'cat') {
          const filePath = args[1];
          if (!filePath) {
            newHistory.push('usage: cat <file>');
          } else {
            const content = fs.readFileSync(filePath, 'utf8');
            newHistory.push(content);
          }
          setTerminalHistory(newHistory);
          return;
        } else if (command === 'pwd') {
          newHistory.push(process.cwd());
          setTerminalHistory(newHistory);
          return;
        }
      } catch (err: any) {
        newHistory.push(`Error: ${err.message}`);
        setTerminalHistory(newHistory);
        return;
      }
    }

    // Execution Engine (./app_name)
    if (trimmedCmd.startsWith('./')) {
      const appName = trimmedCmd.substring(2);
      const pkgName = appName.endsWith('.bbin') ? appName.replace('.bbin', '') : appName;
      const binPath = `/bin/${pkgName}.bbin`;
      const localPath = `${currentDir}/${appName}`;
      
      const executable = vfs[binPath] || vfs[localPath];
      
      if (executable && executable.isExecutable) {
        newHistory.push(`Executing ${executable.name}...`);
        newHistory.push(`Unpacking Brainscript Binary...`);
        newHistory.push(`[HARDWARE] Mapping .text section to 0x00400000`);
        newHistory.push(`[HARDWARE] Mapping .data section to 0x00600000`);
        newHistory.push(`[CPU] Jumping to entry point at 0x00401000`);
        
        if (executable.isGUI && executable.appId) {
          newHistory.push(`[OS] Launching 64-bit GUI application: ${executable.appId}`);
          toggleWindow(executable.appId);
        } else {
          newHistory.push(`Hello from Brainscript v1.0!`);
          newHistory.push(`Process exited with code 0`);
        }
      } else {
        newHistory.push(`bash: ./${appName}: No such file or directory or not executable`);
      }
      setTerminalHistory(newHistory);
      return;
    }

    switch (command) {
      case 'help':
        newHistory.push('Available commands: ls, cat, clear, whoami, sysinfo, help, pkg, pwd, cd' + (isElectron ? ', pwd' : ''));
        break;
      case 'ls':
        if (args[1] === '-l') {
          // Show long format
          const files = Object.keys(vfs).filter(p => {
            const parent = p.substring(0, p.lastIndexOf('/')) || '/';
            return parent === currentDir;
          });
          files.forEach(p => {
            const f = vfs[p];
            const type = f.type === 'dir' ? 'd' : '-';
            const exec = f.isExecutable ? 'x' : '-';
            newHistory.push(`${type}${f.permissions.substring(1)}${exec} guest guest ${f.size || 4096} Apr 4 04:39 ${f.name}${f.isExecutable ? '*' : ''}`);
          });
        } else {
          const files = Object.keys(vfs).filter(p => {
            const parent = p.substring(0, p.lastIndexOf('/')) || '/';
            return parent === currentDir;
          }).map(p => vfs[p].name);
          newHistory.push(files.join('  '));
        }
        break;
      case 'pkg':
        if (args[1] === 'install') {
          const pkgName = args[2];
          if (!pkgName) {
            newHistory.push('usage: pkg install <name>');
          } else {
            installPackage(pkgName);
            return;
          }
        } else {
          newHistory.push('usage: pkg install <name>');
        }
        break;
      case 'cd':
        const target = args[1];
        if (!target || target === '~') {
          setCurrentDir('/home/guest');
        } else if (target === '..') {
          const parent = currentDir.substring(0, currentDir.lastIndexOf('/')) || '/';
          setCurrentDir(parent);
        } else {
          const newPath = target.startsWith('/') ? target : `${currentDir}/${target}`;
          if (vfs[newPath] && vfs[newPath].type === 'dir') {
            setCurrentDir(newPath);
          } else {
            newHistory.push(`cd: ${target}: No such directory`);
          }
        }
        break;
      case 'pwd':
        newHistory.push(currentDir);
        break;
      case 'whoami':
        newHistory.push(userName);
        break;
      case 'sysinfo':
        newHistory.push('OS: GlassOS v1.0.0');
        newHistory.push('Kernel: React 19.0.0');
        newHistory.push('CPU: Virtualized Glass Core i9 @ 5.2GHz');
        newHistory.push('Memory: 32GB Virtual RAM');
        newHistory.push('Uptime: ' + Math.floor(performance.now() / 1000) + 's');
        break;
      case 'top':
        setIsTopMode(true);
        return;
      case 'neofetch':
        newHistory.push('   /\\          OS: GlassOS v1.0.0');
        newHistory.push('  /  \\         Kernel: React 19.0.0');
        newHistory.push(' /    \\        Uptime: ' + Math.floor(performance.now() / 1000) + 's');
        newHistory.push('/______\\       Shell: bash 5.1');
        newHistory.push('               WM: Motion');
        break;
      case 'clear':
        setTerminalHistory([]);
        return;
      case 'cat':
        const filePath = args[1];
        if (!filePath) {
          newHistory.push('usage: cat <file>');
        } else {
          const fullPath = filePath.startsWith('/') ? filePath : `${currentDir}/${filePath}`;
          const file = vfs[fullPath];
          if (file && file.type === 'file') {
            newHistory.push(file.content || '[Binary Data]');
          } else {
            newHistory.push(`cat: ${filePath}: No such file`);
          }
        }
        break;
      case '':
        break;
      default:
        newHistory.push(`command not found: ${command}`);
    }
    setTerminalHistory(newHistory);
  };

  const handleLogout = () => {
    closeWindow('settings');
    setIsStartOpen(false);
    setIsLoggingOut(true);
    
    // Simulate logout/login cycle
    setTimeout(() => {
      setIsLoggingOut(false);
      setUserName('New User');
      setTempName('New User');
      setConnectedNetwork(null);
    }, 2500);
  };

  const handleConnect = () => {
    if (!selectedNetwork) return;
    setIsConnecting(true);
    setTimeout(() => {
      setConnectedNetwork(selectedNetwork);
      setIsConnecting(false);
    }, 2000);
  };

  const handleElectronAction = (action: string) => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send(`window-${action}`);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-[background-image] duration-500 ease-in-out"
      style={{ backgroundImage: `url('${wallpaper}')` }}
    >
      {/* Electron Global Title Bar */}
      {isElectron && (
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-[30000] electron-drag bg-black/20 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">GlassOS</span>
          </div>
          <div className="flex items-center gap-1 electron-no-drag">
            <button 
              onClick={() => handleElectronAction('minimize')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            >
              <Minus size={12} />
            </button>
            <button 
              onClick={() => handleElectronAction('maximize')}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            >
              <Maximize2 size={12} />
            </button>
            <button 
              onClick={() => handleElectronAction('close')}
              className="p-1.5 hover:bg-red-500/50 rounded-md transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Logout/Welcome Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[20000] bg-slate-950 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
                <User size={48} />
              </div>
              <h2 className="text-3xl font-light tracking-tight mb-2">Welcome</h2>
              <p className="text-white/40 animate-pulse">Preparing your desktop...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="absolute inset-0 p-6 flex flex-col flex-wrap content-start gap-4">
        <DesktopIcon 
          id="files" 
          label="My Files" 
          icon={<Folder className="text-blue-400" size={32} />} 
          onClick={() => toggleWindow('files')}
        />
        <DesktopIcon 
          id="browser" 
          label="Browser" 
          icon={<Globe className="text-emerald-400" size={32} />} 
          onClick={() => toggleWindow('browser')}
        />
        <DesktopIcon 
          id="settings" 
          label="Settings" 
          icon={<Settings className="text-gray-300" size={32} />} 
          onClick={() => toggleWindow('settings')}
        />
        <DesktopIcon 
          id="terminal" 
          label="Terminal" 
          icon={<Terminal className="text-purple-400" size={32} />} 
          onClick={() => toggleWindow('terminal')}
        />
        <DesktopIcon 
          id="music" 
          label="Music" 
          icon={<Music className="text-pink-400" size={32} />} 
          onClick={() => toggleWindow('music')}
        />
        <DesktopIcon 
          id="photos" 
          label="Photos" 
          icon={<ImageIcon className="text-orange-400" size={32} />} 
          onClick={() => toggleWindow('photos')}
        />
        <DesktopIcon 
          id="codestudio" 
          label="Code Studio" 
          icon={<Code className="text-blue-400" size={32} />} 
          onClick={() => toggleWindow('codestudio')}
        />
        <DesktopIcon 
          id="calculator" 
          label="Calculator" 
          icon={<LayoutGrid className="text-yellow-400" size={32} />} 
          onClick={() => toggleWindow('calculator')}
        />
      </div>

      {/* Windows Layer */}
      <AnimatePresence>
        {windows.map(win => (
          <Window 
            key={win.id} 
            window={win} 
            onClose={() => closeWindow(win.id)} 
            onMinimize={() => minimizeWindow(win.id)}
            onFocus={() => focusWindow(win.id)}
            onSnap={(mode) => handleSnap(win.id, mode)}
          >
            {win.id === 'settings' ? (
              <div className="space-y-6">
                {settingsView === 'main' ? (
                  <>
                    <div className="flex items-center gap-4 p-4 glass-dark rounded-xl">
                      <button 
                        onClick={() => handleLogout()}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer group relative"
                        title="Click to Logout"
                      >
                        <User size={24} />
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Power size={14} className="text-white" />
                        </div>
                      </button>
                      <div className="flex-1">
                        {isEditingName ? (
                          <input
                            autoFocus
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setUserName(tempName);
                                setIsEditingName(false);
                              } else if (e.key === 'Escape') {
                                setTempName(userName);
                                setIsEditingName(false);
                              }
                            }}
                            onBlur={() => {
                              setUserName(tempName);
                              setIsEditingName(false);
                            }}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <h3 
                            className="font-medium cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => {
                              setTempName(userName);
                              setIsEditingName(true);
                            }}
                          >
                            {userName}
                          </h3>
                        )}
                        <p className="text-xs text-white/50">Local Account</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {['System', 'Devices', 'Network', 'Personalization', 'Apps', 'Privacy'].map(item => (
                        <div 
                          key={item} 
                          onClick={() => setSettingsView(item.toLowerCase())}
                          className="p-3 glass-button rounded-lg flex items-center gap-3"
                        >
                          <div className="p-2 bg-white/5 rounded-md group-hover:bg-white/20 transition-colors">
                            {item === 'Network' ? <Wifi size={16} /> : <Settings size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item}</span>
                            {item === 'Network' && connectedNetwork && (
                              <span className="text-[10px] text-emerald-400 font-medium">Connected: {connectedNetwork}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : settingsView === 'personalization' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button 
                        onClick={() => setSettingsView('main')}
                        className="p-2 glass-button rounded-lg"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <h3 className="font-medium">Personalization</h3>
                    </div>
                    <p className="text-sm text-white/70 mb-4">Choose your desktop background</p>
                    <div className="grid grid-cols-2 gap-4">
                      {wallpapers.map(wp => (
                        <button
                          key={wp.id}
                          onClick={() => setWallpaper(wp.url)}
                          className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${wallpaper === wp.url ? 'border-blue-500 scale-105' : 'border-transparent hover:border-white/30'}`}
                        >
                          <img 
                            src={wp.url} 
                            alt={wp.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] font-medium">{wp.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : settingsView === 'network' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button 
                        onClick={() => setSettingsView('main')}
                        className="p-2 glass-button rounded-lg"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <h3 className="font-medium">Network & Internet</h3>
                    </div>
                    
                    <div className="p-4 glass-dark rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${connectedNetwork ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                          {connectedNetwork ? <Wifi size={24} /> : <WifiOff size={24} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{connectedNetwork ? 'Connected' : 'Not Connected'}</p>
                          <p className="text-xs text-white/50">{connectedNetwork || 'Select a network to connect'}</p>
                        </div>
                      </div>
                      {connectedNetwork && (
                        <button 
                          onClick={() => setConnectedNetwork(null)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-1">Available Networks</p>
                      {networks.map(net => (
                        <div 
                          key={net}
                          onClick={() => !isConnecting && setSelectedNetwork(net)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${selectedNetwork === net ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              checked={selectedNetwork === net} 
                              onChange={() => {}}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm">{net}</span>
                          </div>
                          <Wifi size={14} className="text-white/20" />
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={!selectedNetwork || isConnecting || connectedNetwork === selectedNetwork}
                      onClick={handleConnect}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:bg-white/5 disabled:text-white/20 disabled:shadow-none transition-all font-medium text-sm flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button 
                        onClick={() => setSettingsView('main')}
                        className="p-2 glass-button rounded-lg"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <h3 className="font-medium capitalize">{settingsView} Settings</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 text-white/30">
                      <Settings size={48} className="mb-4 opacity-20" />
                      <p className="text-sm">This section is under construction.</p>
                      <p className="text-[10px] mt-2 italic">Coming soon in GlassOS v1.1</p>
                    </div>
                  </div>
                )}
              </div>
            ) : win.id === 'files' ? (
              <div className="flex flex-col h-full gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search files and folders..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:bg-white/10 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Projects', 'Desktop', 'System', 'Users']
                    .filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                    .map(folder => (
                      <div key={folder} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group">
                        <Folder className="text-blue-400 group-hover:scale-110 transition-transform" size={40} />
                        <span className="text-xs">{folder}</span>
                      </div>
                    ))}
                </div>
                {['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Projects', 'Desktop', 'System', 'Users']
                  .filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase())).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                    <Search size={32} className="mb-2 opacity-20" />
                    <p className="text-xs">No items match your search</p>
                  </div>
                )}
              </div>
            ) : win.id === 'terminal' ? (
              <div 
                className="font-mono text-sm h-full flex flex-col cursor-text"
                onClick={() => document.getElementById('terminal-input')?.focus()}
              >
                {isTopMode ? (
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-4 border-b border-white/20 pb-1 mb-2 text-blue-400 font-bold">
                      <span>PID</span>
                      <span>PROCESS</span>
                      <span>%CPU</span>
                      <span>MEM</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      {topData.map(p => (
                        <div key={p.pid} className="grid grid-cols-4">
                          <span>{p.pid}</span>
                          <span className="text-green-400">{p.process}</span>
                          <span>{p.cpu}%</span>
                          <span>{p.mem}MB</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-2 border-t border-white/20 text-white/40 animate-pulse">
                      Press Q to exit top
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-1 mb-2 scrollbar-hide">
                      {terminalHistory.map((line, i) => (
                        <p key={i} className={line.includes('guest@glass-os') ? 'text-green-400' : 'text-white/80'}>
                          {line}
                        </p>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>
                    <div className="flex items-center gap-2 text-green-400 shrink-0">
                      <span>guest@glass-os:~$</span>
                      <input
                        id="terminal-input"
                        autoFocus
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            processCommand(terminalInput);
                            setTerminalInput('');
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-white caret-green-400"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : win.id === 'codestudio' ? (
              <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] font-mono text-sm overflow-hidden rounded-b-xl -m-6">
                {/* IDE Toolbar */}
                <div className="h-10 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-4">
                    {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(item => (
                      <button key={item} className="text-xs hover:text-white transition-colors">{item}</button>
                    ))}
                  </div>
                  <button 
                    onClick={() => addToast('Compiling main.b...', 'info')}
                    className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1 rounded-md border border-green-600/30 transition-all group"
                  >
                    <Play size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Build .exe</span>
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* IDE Sidebar */}
                  <div className="w-[200px] bg-[#0d1117] border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-2 text-[10px] uppercase tracking-widest opacity-40 font-bold">Explorer</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer">
                        <ChevronDown size={14} />
                        <Folder size={14} className="text-blue-400" />
                        <span>src</span>
                      </div>
                      <div className="pl-6 flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer text-blue-300">
                        <FileCode size={14} />
                        <span>main.b</span>
                      </div>
                      <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer">
                        <ChevronRight size={14} />
                        <Folder size={14} className="text-yellow-400" />
                        <span>include</span>
                      </div>
                      <div className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer">
                        <ChevronRight size={14} />
                        <Folder size={14} className="text-green-400" />
                        <span>build</span>
                      </div>
                    </div>
                  </div>

                  {/* IDE Editor */}
                  <div className="flex-1 relative flex flex-col">
                    <div className="h-8 bg-[#161b22] flex items-center px-4 border-b border-white/5">
                      <div className="flex items-center gap-2 bg-[#0d1117] px-3 h-full border-t-2 border-blue-500 text-xs">
                        <FileCode size={12} className="text-blue-400" />
                        <span>main.b</span>
                        <X size={12} className="ml-2 opacity-40 hover:opacity-100 cursor-pointer" />
                      </div>
                    </div>
                    <textarea
                      defaultValue={`// Brainscript v1.0 \nfunc main() { \n    print('Hello GlassOS'); \n }`}
                      spellCheck={false}
                      className="flex-1 bg-transparent p-4 outline-none resize-none scrollbar-hide selection:bg-blue-500/30"
                    />
                  </div>
                </div>

                {/* IDE Status Bar */}
                <div className="h-6 bg-blue-600 flex items-center justify-between px-4 text-[10px] text-white shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <LayoutGrid size={10} />
                      <span>main</span>
                    </div>
                    <span>0 Errors</span>
                    <span>0 Warnings</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Ln 1, Col 1</span>
                    <span>Spaces: 4</span>
                    <span>UTF-8</span>
                    <span>Brainscript</span>
                  </div>
                </div>
              </div>
            ) : win.content}
          </Window>
        ))}
      </AnimatePresence>

      {/* Toasts */}
      <div className="absolute bottom-20 right-4 z-[40000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="glass-dark px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 pointer-events-auto shadow-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Start Menu */}
      <AnimatePresence>
        {isStartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="absolute bottom-16 left-4 w-96 h-[500px] glass rounded-2xl overflow-hidden flex flex-col z-[9999]"
          >
            <div className="p-6 flex-1">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type="text" 
                  placeholder="Search apps, files, and settings"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white/10 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {windows.map(app => (
                  <button
                    key={app.id}
                    onClick={() => toggleWindow(app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/20 transition-colors">
                      {app.icon}
                    </div>
                    <span className="text-[10px] font-medium text-white/80">{app.title}</span>
                  </button>
                ))}
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                  <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/20 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="text-[10px] font-medium text-white/80">Mail</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                  <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/20 transition-colors">
                    <LayoutGrid size={18} />
                  </div>
                  <span className="text-[10px] font-medium text-white/80">Apps</span>
                </button>
              </div>
            </div>

            <div className="h-16 glass-dark flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <button 
                onClick={() => handleLogout()}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Power size={18} className="text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 glass-dark flex items-center justify-between px-4 z-[10000]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`p-2 rounded-lg transition-all duration-300 ${isStartOpen ? 'bg-white/20 scale-90' : 'hover:bg-white/10'}`}
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md flex items-center justify-center shadow-lg">
              <Monitor size={14} className="text-white" />
            </div>
          </button>
          
          <div className="h-6 w-[1px] bg-white/10 mx-2" />

          <div className="flex items-center gap-1">
            {windows.filter(w => w.isOpen).map(win => (
              <button
                key={win.id}
                onClick={() => {
                  if (win.isMinimized) {
                    setWindows(prev => prev.map(w => w.id === win.id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w));
                    setMaxZIndex(maxZIndex + 1);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${!win.isMinimized ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                {win.icon}
                <div className={`w-1 h-1 rounded-full bg-blue-400 ${win.isOpen ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex items-center gap-3 text-white/60">
            {isConnecting ? (
              <Loader2 size={16} className="animate-spin text-blue-400" />
            ) : connectedNetwork ? (
              <Wifi size={16} className="text-emerald-400" />
            ) : (
              <WifiOff size={16} />
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-white/50">
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
