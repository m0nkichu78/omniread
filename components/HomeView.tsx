import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, InstantMixIcon, ArrowRightIcon, FileTextIcon, SparklesIcon } from './Icons';
import { Language, Tone, Mode, ReadingConfig } from '../types';

interface HomeViewProps {
  onProcess: (input: string, config: ReadingConfig) => void;
  isProcessing: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ onProcess, isProcessing }) => {
  const [input, setInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ReadingConfig>({
    targetLanguage: Language.FRENCH,
    tone: Tone.NEUTRAL,
    mode: Mode.FULL
  });
  const configRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Close config when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (configRef.current && !configRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onProcess(input, config);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-4xl mx-auto">
      
      {/* Hero Text */}
      <div className="text-center mb-10 space-y-4 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-serif italic text-brand-dark dark:text-stone-100 transition-colors">
          Un espace de lecture calme.
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-lg md:text-xl max-w-2xl mx-auto font-light transition-colors">
          Transformez n'importe quel lien en une expérience de lecture traduite, résumée et narrée.
        </p>
      </div>

      {/* Mode Toggles */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setConfig({ ...config, mode: Mode.FULL })}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-transparent ${
            config.mode === Mode.FULL 
              ? 'bg-brand-dark text-white dark:bg-stone-100 dark:text-stone-900 shadow-lg scale-105' 
              : 'bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <FileTextIcon className="w-4 h-4" />
          {Mode.FULL}
        </button>
        <button
          onClick={() => setConfig({ ...config, mode: Mode.SUMMARY })}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border border-transparent ${
            config.mode === Mode.SUMMARY 
              ? 'bg-brand-orange text-white shadow-lg scale-105' 
              : 'bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          {Mode.SUMMARY}
        </button>
      </div>

      {/* Input Area */}
      <div className="relative w-full max-w-2xl" ref={inputRef}>
        <form onSubmit={handleSubmit} className={`relative flex items-center bg-white dark:bg-stone-800 border-2 transition-all duration-300 rounded-full p-1 shadow-sm ${showConfig ? 'border-brand-orange shadow-lg' : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'}`}>
          <div className="pl-4 text-stone-400">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Collez une URL d'article ou du texte..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-stone-700 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-500"
          />
          <div className="flex items-center gap-1 pr-1">
             <button 
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2.5 rounded-full transition-colors ${showConfig ? 'bg-stone-100 dark:bg-stone-700 text-brand-orange' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
             >
                <InstantMixIcon className="w-5 h-5" />
             </button>
             <button 
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="p-2.5 rounded-full bg-stone-600 text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" />
                )}
             </button>
          </div>
        </form>

        {/* Config Popover */}
        {showConfig && (
          <div ref={configRef} className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-xl p-6 z-20 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Column */}
                <div>
                    <h3 className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-4">Langue de destination</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(Language).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setConfig({ ...config, targetLanguage: lang })}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    config.targetLanguage === lang 
                                    ? 'bg-white dark:bg-stone-700 border border-brand-dark dark:border-stone-400 text-brand-dark dark:text-stone-200 font-medium' 
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 border border-transparent'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tone Column */}
                <div>
                    <h3 className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-4">Ton de la traduction</h3>
                    <div className="flex flex-col gap-2">
                        {Object.values(Tone).map((tone) => (
                            <button
                                key={tone}
                                onClick={() => setConfig({ ...config, tone: tone })}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    config.tone === tone 
                                    ? 'text-brand-orange border border-brand-orange bg-orange-50/30 dark:bg-orange-900/20 font-medium' 
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 border border-transparent'
                                }`}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default HomeView;