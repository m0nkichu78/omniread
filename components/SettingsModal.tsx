import React, { useState, useEffect } from 'react';
import { CloseIcon, KeyIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSaveApiKey }) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl p-6 z-50 animate-fade-in border border-stone-100 dark:border-stone-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-brand-dark dark:text-stone-100">Paramètres</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
              Clé API Google Gemini
            </label>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
              Pour utiliser OmniRead gratuitement, vous devez utiliser votre propre clé API. 
              La clé est stockée uniquement dans votre navigateur.
            </p>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="w-4 h-4 text-stone-400" />
              </div>
              <input 
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-20 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:border-brand-orange dark:text-stone-200 transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-stone-500 hover:text-brand-orange"
              >
                {showKey ? "Masquer" : "Afficher"}
              </button>
            </div>
            
            <div className="mt-3 text-right">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-medium text-brand-orange hover:underline"
                >
                  Obtenir une clé gratuite ↗
                </a>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 bg-brand-dark dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;