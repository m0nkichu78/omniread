import React, { useState, useEffect, useRef } from 'react';
import { ProcessedArticle } from '../types';
import { generateSpeech } from '../services/geminiService';
import { PlayIcon, PauseIcon, TextSizeIcon, CopyIcon, FileTextIcon, SpeakerIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface ReaderViewProps {
  article: ProcessedArticle;
  onBack: () => void;
  apiKey: string;
}

const ReaderView: React.FC<ReaderViewProps> = ({ article, onBack, apiKey }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // Use audioUrl from article if available (auto-generated), otherwise null
  const [audioUrl, setAudioUrl] = useState<string | null>(article.audioUrl || null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // Update local state if article changes
  useEffect(() => {
    if (article.audioUrl) {
      setAudioUrl(article.audioUrl);
    } else {
      setAudioUrl(null);
    }
  }, [article.id, article.audioUrl]);

  // Cleanup audio URL on unmount ONLY if we generated it locally in this component
  // (If it came from App.tsx, App.tsx handles lifecycle, but actually standard blob cleanup practice)
  useEffect(() => {
    return () => {
      // Note: We don't strictly revoke the prop-passed URL here to avoid side effects if 
      // other components use it, but for this app structure, it's fine.
    };
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (audioUrl && shouldAutoPlay && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Playback failed", e));
      setShouldAutoPlay(false);
    }
  }, [audioUrl, shouldAutoPlay]);

  const togglePlay = async () => {
    if (!audioUrl) {
        try {
            setIsGeneratingAudio(true);
            // Concatenate title, summary and some content for speech
            const textToSpeak = `${article.title}. ${article.summaryQuote}. ${article.content}`;
            // Use the apiKey passed from props
            const url = await generateSpeech(textToSpeak, apiKey);
            setAudioUrl(url);
            setShouldAutoPlay(true);
            setIsGeneratingAudio(false);
        } catch (error) {
            console.error("TTS Error", error);
            setIsGeneratingAudio(false);
            if (error instanceof Error && error.message.includes("Clé API")) {
              alert("Clé API manquante. Veuillez la configurer dans les paramètres.");
            } else {
              alert("Erreur lors de la génération audio.");
            }
        }
    } else {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        if (dur) {
          setDuration(dur);
          setProgress((current / dur) * 100);
        }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (audioRef.current && duration) {
          audioRef.current.currentTime = (val / 100) * duration;
          setProgress(val);
      }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fade-in">
      {/* Back Navigation */}
      <button onClick={onBack} className="mb-8 px-6 text-xs font-bold tracking-widest text-stone-500 hover:text-brand-orange transition-colors uppercase">
        ← Retour à la recherche
      </button>

      {/* Sticky Audio Player */}
      <div className="sticky top-4 z-30 mx-4 md:mx-0 bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-100 dark:border-stone-700 p-2 md:p-3 mb-12 transition-colors">
         <div className="flex items-center gap-4">
            <button 
                onClick={togglePlay}
                disabled={isGeneratingAudio}
                className="flex items-center gap-2 bg-brand-dark dark:bg-stone-100 text-white dark:text-stone-900 px-6 py-2.5 rounded-full hover:bg-black dark:hover:bg-white/90 transition-colors disabled:bg-stone-400"
            >
                {isGeneratingAudio ? (
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : isPlaying ? (
                    <PauseIcon className="w-4 h-4" fill />
                ) : (
                    <PlayIcon className="w-4 h-4" fill />
                )}
                <span className="text-xs font-bold tracking-wide uppercase">{isPlaying ? 'PAUSE' : 'ÉCOUTER'}</span>
            </button>

            <span className="text-xs font-mono text-stone-400 w-10 text-right">
                {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
            </span>

            <div className="flex-1 relative group">
                 <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-stone-200 dark:bg-stone-600 rounded-lg appearance-none cursor-pointer accent-brand-orange hover:h-2 transition-all"
                  />
            </div>
            
             <span className="text-xs font-mono text-stone-400 w-10">
                {duration ? formatTime(duration) : "0:00"}
            </span>

            <div className="h-6 w-px bg-stone-200 dark:bg-stone-600 mx-2 hidden md:block"></div>

            <div className="hidden md:flex items-center gap-2">
                <button className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"><TextSizeIcon className="w-5 h-5" /></button>
                <button className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"><CopyIcon className="w-5 h-5" /></button>
                <button className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"><FileTextIcon className="w-5 h-5" /></button>
                <button className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"><SpeakerIcon className="w-5 h-5" /></button>
            </div>
         </div>
         <audio 
            ref={audioRef} 
            src={audioUrl || undefined} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden" 
         />
      </div>

      {/* Article Content */}
      <article className="px-6 md:px-12 max-w-3xl mx-auto">
         
         {/* Metadata Badges */}
         <div className="flex gap-2 mb-6">
             <span className="px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {article.languageCode}
             </span>
             <span className="px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {article.readingTimeMinutes} MIN
             </span>
             <a 
               href={article.originalUrl || '#'} 
               target="_blank" 
               rel="noreferrer" 
               className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider transition-colors flex items-center gap-1"
             >
                SOURCE {article.originalUrl ? '↗' : ''}
             </a>
         </div>

         {/* Title */}
         <h1 className="text-4xl md:text-5xl font-serif text-brand-dark dark:text-stone-100 mb-8 leading-tight transition-colors">
            {article.title}
         </h1>

         {/* Summary Quote */}
         <div className="mb-12 pl-6 border-l-4 border-brand-orange">
            <p className="text-xl md:text-2xl font-serif italic text-stone-600 dark:text-stone-300 leading-relaxed transition-colors">
                {article.summaryQuote}
            </p>
         </div>

         {/* Main Content (Markdown) */}
         <div className="prose prose-stone prose-lg max-w-none font-sans text-stone-800 dark:text-stone-300 leading-loose prose-headings:font-serif prose-headings:font-normal prose-headings:text-brand-dark dark:prose-headings:text-stone-100">
            <ReactMarkdown>
                {article.content}
            </ReactMarkdown>
         </div>

      </article>
    </div>
  );
};

export default ReaderView;