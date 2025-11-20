import React from 'react';
import { CloseIcon, HistoryIcon, TrashIcon, ArrowRightIcon } from './Icons';
import { ProcessedArticle } from '../types';

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ProcessedArticle[];
  onSelectArticle: (article: ProcessedArticle) => void;
  onClearHistory: () => void;
}

const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ isOpen, onClose, history, onSelectArticle, onClearHistory }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-cream dark:bg-stone-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
                <HistoryIcon className="w-5 h-5 text-brand-orange" />
                <h2 className="text-xl font-serif italic text-brand-dark dark:text-stone-100">Historique</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-stone-400 mt-10">
                <p>Votre historique est vide.</p>
              </div>
            ) : (
              history.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                  className="group bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-lg p-4 hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer"
                >
                  {/* Changed to font-sans (default) for cleaner list legibility compared to Instrument Serif */}
                  <h3 className="font-medium text-stone-800 dark:text-stone-200 line-clamp-2 mb-2 leading-snug group-hover:text-brand-orange transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                    {article.summaryQuote}
                  </p>
                  <div className="flex justify-between items-center text-xs text-stone-400 dark:text-stone-500">
                    <span>{article.date}</span>
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50">
             <button 
                onClick={onClearHistory}
                disabled={history.length === 0}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <TrashIcon className="w-4 h-4" />
                EFFACER TOUT
             </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default LibrarySidebar;