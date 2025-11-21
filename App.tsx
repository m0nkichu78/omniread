import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ReaderView from './components/ReaderView';
import LibrarySidebar from './components/LibrarySidebar';
import SettingsModal from './components/SettingsModal';
import Toast, { ToastType } from './components/Toast';
import { ReadingConfig, ProcessedArticle } from './types';
import { processContent, generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'READER'>('HOME');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ProcessedArticle | null>(null);
  const [history, setHistory] = useState<ProcessedArticle[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  // Load initialization data (history, dark mode, api key)
  useEffect(() => {
    const savedHistory = localStorage.getItem('omniread_history');
    if (savedHistory) {
        try {
            setHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Failed to load history");
        }
    }

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    // Load API Key
    const savedKey = localStorage.getItem('omniread_api_key');
    if (savedKey) {
        setApiKey(savedKey);
    } else {
        // Show settings modal on first visit if no key is configured
        setIsSettingsOpen(true);
    }
  }, []);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1c1917'; // stone-900
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FDFBF7'; // brand-cream
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      if (key) {
        localStorage.setItem('omniread_api_key', key);
        showToast("Clé API sauvegardée avec succès.", 'success');
      } else {
        localStorage.removeItem('omniread_api_key');
      }
  };

  // Save history
  useEffect(() => {
    // We don't save audioUrl to localStorage as Blob URLs expire
    const historyToSave = history.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('omniread_history', JSON.stringify(historyToSave));
  }, [history]);

  const handleProcess = async (input: string, config: ReadingConfig) => {
    const effectiveKey = apiKey;

    if (!effectiveKey) {
        setIsSettingsOpen(true);
        showToast("Veuillez configurer votre clé API Google Gemini pour continuer.", 'info');
        return;
    }

    setIsProcessing(true);
    try {
        // 1. Translate/Summarize
        const result = await processContent(input, config, effectiveKey);
        
        // 2. Generate Audio Immediately
        let audioUrl: string | undefined;
        try {
          const textToSpeak = `${result.title}. ${result.summaryQuote}. ${result.content}`;
          audioUrl = await generateSpeech(textToSpeak, effectiveKey);
        } catch (audioError) {
          console.warn("Auto-TTS failed:", audioError);
          // We do NOT block the app flow here, just show a warning toast
          showToast("L'article est prêt, mais l'audio n'a pas pu être généré automatiquement (quota ?).", 'info');
        }

        const newArticle: ProcessedArticle = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fr-FR'),
            config,
            audioUrl, // Attach the auto-generated audio if successful
            ...result
        };

        // Add to history
        setHistory(prev => [newArticle, ...prev]);
        setCurrentArticle(newArticle);
        setView('READER');
        showToast("Traitement terminé avec succès !", 'success');
        
    } catch (error: any) {
        console.error("Processing error:", error);
        
        // Check specifically for API Key error to reopen settings
        if (error.message && (error.message.includes('Clé API') || error.message.includes('invalide'))) {
            setIsSettingsOpen(true);
        }
        
        showToast(error.message || "Une erreur est survenue.", 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
      if(window.confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
          setHistory([]);
          showToast("Historique effacé.", 'info');
      }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 dark:bg-stone-900">
      <Header 
        onOpenLibrary={() => setIsLibraryOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        hasApiKey={!!apiKey}
      />

      <main className="flex-1 flex flex-col w-full">
        {view === 'HOME' && (
            <HomeView onProcess={handleProcess} isProcessing={isProcessing} />
        )}
        {view === 'READER' && currentArticle && (
            <ReaderView 
                article={currentArticle} 
                onBack={() => setView('HOME')}
                apiKey={apiKey}
                onShowToast={showToast}
            />
        )}
      </main>

      <LibrarySidebar 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        history={history}
        onSelectArticle={(article) => {
            setCurrentArticle(article);
            setView('READER');
        }}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;