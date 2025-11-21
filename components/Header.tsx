import React from 'react';
import { MoonIcon, LibraryIcon, SettingsIcon, KeyIcon } from './Icons';

interface HeaderProps {
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  hasApiKey: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenLibrary, onOpenSettings, isDarkMode, toggleTheme, hasApiKey }) => {
  return (
    <header className="flex justify-between items-center px-6 py-6 md:px-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
        <h1 className="text-2xl font-serif italic font-medium text-brand-orange">Omni<span className="not-italic text-brand-dark dark:text-stone-200 font-normal">Read</span></h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* API Key Status Indicator */}
        <button
          onClick={onOpenSettings}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            hasApiKey 
              ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
              : 'border-brand-orange/30 bg-orange-50 text-brand-orange dark:bg-orange-900/20 dark:border-brand-orange/30'
          }`}
        >
          <KeyIcon className="w-3 h-3" />
          {hasApiKey ? 'Clé API active' : 'Configurer Clé API'}
        </button>

        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
          aria-label="Paramètres"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
          aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
        >
          <MoonIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors text-sm font-medium text-stone-700 dark:text-stone-300"
        >
            <span className="rotate-90">
                <span className="inline-block transform -rotate-90">
                    <LibraryIcon className="w-4 h-4" />
                </span>
            </span>
          <span className="hidden md:inline">Bibliothèque</span>
        </button>
      </div>
    </header>
  );
};

export default Header;