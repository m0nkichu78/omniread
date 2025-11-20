import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ReaderView from './components/ReaderView';
import LibrarySidebar from './components/LibrarySidebar';
import { ReadingConfig, ProcessedArticle } from './types';
import { processContent, generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'READER'>('HOME');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ProcessedArticle | null>(null);
  const [history, setHistory] = useState<ProcessedArticle[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('omniread_history');
    if (saved) {
        try {
            setHistory(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load history");
        }
    }

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
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

  // Save history
  useEffect(() => {
    // We don't save audioUrl to localStorage as Blob URLs expire
    const historyToSave = history.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('omniread_history', JSON.stringify(historyToSave));
  }, [history]);

  const handleProcess = async (input: string, config: ReadingConfig) => {
    setIsProcessing(true);
    try {
        // 1. Translate/Summarize
        const result = await processContent(input, config);
        
        // 2. Generate Audio Immediately
        let audioUrl: string | undefined;
        try {
          const textToSpeak = `${result.title}. ${result.summaryQuote}. ${result.content}`;
          audioUrl = await generateSpeech(textToSpeak);
        } catch (audioError) {
          console.error("Audio generation failed automatically (will be available on manual click):", audioError);
          // We continue even if audio fails, so the user gets the text
        }

        const newArticle: ProcessedArticle = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fr-FR'),
            config,
            audioUrl, // Attach the auto-generated audio
            ...result
        };

        // Add to history
        setHistory(prev => [newArticle, ...prev]);
        setCurrentArticle(newArticle);
        setView('READER');
    } catch (error) {
        console.error("Processing error:", error);
        alert("Une erreur est survenue lors du traitement. Veuillez vérifier votre clé API ou réessayer.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
      if(window.confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
          setHistory([]);
      }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 dark:bg-stone-900">
      <Header 
        onOpenLibrary={() => setIsLibraryOpen(true)} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col w-full">
        {view === 'HOME' && (
            <HomeView onProcess={handleProcess} isProcessing={isProcessing} />
        )}
        {view === 'READER' && currentArticle && (
            <ReaderView 
                article={currentArticle} 
                onBack={() => setView('HOME')} 
            />
        )}
      </main>

      <LibrarySidebar 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        history={history}
        onSelectArticle={(article) => {
            // When selecting from history, audioUrl is likely undefined (not saved to LS)
            // The ReaderView handles this by allowing regeneration
            setCurrentArticle(article);
            setView('READER');
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default App;