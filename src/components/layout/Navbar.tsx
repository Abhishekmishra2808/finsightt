import React, { useState, useEffect } from 'react';
import { LineChart, Search, FileText, Map as MapIcon, ShieldAlert, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onViewChange?: (view: 'landing' | 'analyzer' | 'gst' | 'map' | 'defaulter') => void;
  currentView?: 'landing' | 'analyzer' | 'gst' | 'map' | 'defaulter';
}

export default function Navbar({ onViewChange, currentView }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <>
      <div className="sticky top-4 z-50 px-4 flex justify-center w-full pointer-events-none">
        <motion.nav 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full max-w-5xl border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16 flex items-center justify-between px-6 rounded-full shadow-md pointer-events-auto transition-shadow hover:shadow-xl"
        >
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onViewChange?.('landing')}
          >
          <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
            <LineChart className="w-5 h-5" />
          </div>
          <span className="font-medium text-xl tracking-tight font-heading">FinSight</span>
        </div>
        
        {onViewChange && currentView !== 'landing' && (
          <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border">
            <button
              onClick={() => onViewChange('analyzer')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentView === 'analyzer' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Analyzer
            </button>
            <button
              onClick={() => onViewChange('gst')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentView === 'gst' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Search className="w-4 h-4" />
              GST Search
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentView === 'map' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => onViewChange('defaulter')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentView === 'defaulter' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Defaulters
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        </motion.nav>
      </div>
    </>
  );
}
