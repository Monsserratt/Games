import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Consulting the AI oracle...",
  "Weaving words into a grid...",
  "Crafting clever clues...",
  "Polishing the final puzzle...",
  "Just a few more moments...",
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/50 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-200 font-display">Generating Your Puzzle</h2>
      <p className="text-slate-400 font-body w-64 h-10 flex items-center justify-center">{message}</p>
    </div>
  );
};

export default LoadingSpinner;