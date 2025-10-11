import React, { useState, useCallback, useMemo, useEffect } from 'react';
import TopicForm, { GenerateOptions } from './components/TopicForm';
import CrosswordGrid from './components/CrosswordGrid';
import ClueList from './components/ClueList';
import LoadingSpinner from './components/LoadingSpinner';
import { generateCrossword, generateTopicText } from './services/geminiService';
import { CheckIcon, ArrowPathIcon, LightbulbIcon, PrinterIcon } from './components/Icons';
import type { PuzzleData, Clue, UserAnswers, CheckedAnswers } from './types';
import PrintLayout from './components/PrintLayout';

const themes = {
    'cyber-wave': 'Ｃｙｂｅｒ Ｗａｖｅ 🔮',
    'vaporwave': 'Ｖａｐｏｒｗａｖｅ 🌴',
    'cottagecore': 'Ｃｏｔｔａｇｅｃｏｒｅ 🍄',
    'dark-academia': 'Ｄａｒｋ Ａｃａｄｅｍｉａ 📜',
    'cyberpunk': 'Ｃｙｂｅｒｐｕｎｋ 🌃',
    'solarpunk': 'Ｓｏｌａｒｐｕｎｋ 🌻',
    'lo-fi': 'Ｌｏ－Ｆｉ Ｖｉｂｅｓ 🎧',
    'sky-blue': 'Ｓｋｙ Ｂｌｕｅ ☁️',
    'hydrangea': 'Ｈｙｄｒａｎｇｅａ 🌸',
};

type ThemeKey = keyof typeof themes;

const App: React.FC = () => {
    const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeClue, setActiveClue] = useState<Clue | null>(null);
    const [checkedAnswers, setCheckedAnswers] = useState<CheckedAnswers | null>(null);
    const [theme, setTheme] = useState<ThemeKey>('cyber-wave');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const handleGenerate = useCallback(async (options: GenerateOptions) => {
        setIsLoading(true);
        setError(null);
        setPuzzleData(null);
        setUserAnswers({});
        setActiveClue(null);
        setCheckedAnswers(null);
        
        try {
            let contentToProcess = options.content;
            if (options.source === 'ai') {
                contentToProcess = await generateTopicText(options.content, options.language);
            }
            const data = await generateCrossword(contentToProcess, options.wordCount, options.difficulty, options.language);
            setPuzzleData(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnswerChange = (row: number, col: number, value: string) => {
        setUserAnswers(prev => ({ ...prev, [`${row}-${col}`]: value }));
        setCheckedAnswers(null); // Clear checks on new input
    };
    
    const cellToClueMap = useMemo(() => {
        if (!puzzleData) return {};
        const map: { [key: string]: Clue[] } = {};
        for(const clue of puzzleData.clues) {
            for(let i = 0; i < clue.answer.length; i++) {
                const row = clue.direction === 'down' ? clue.row + i : clue.row;
                const col = clue.direction === 'across' ? clue.col + i : clue.col;
                const key = `${row}-${col}`;
                if (!map[key]) map[key] = [];
                map[key].push(clue);
            }
        }
        return map;
    }, [puzzleData]);

    const handleCellSelect = (row: number, col: number) => {
        const key = `${row}-${col}`;
        const cluesForCell = cellToClueMap[key];
        if (!cluesForCell || cluesForCell.length === 0) return;

        if (activeClue && cluesForCell.includes(activeClue) && cluesForCell.length > 1) {
            // If the current cell is an intersection, toggle between clues
            const otherClue = cluesForCell.find(c => c !== activeClue);
            setActiveClue(otherClue || cluesForCell[0]);
        } else {
            // Default to 'across' if available, otherwise first clue
            const acrossClue = cluesForCell.find(c => c.direction === 'across');
            setActiveClue(acrossClue || cluesForCell[0]);
        }
    };
    
    const handleCheckPuzzle = () => {
        if (!puzzleData) return;
        const checks: CheckedAnswers = {};
        puzzleData.clues.forEach(clue => {
            for (let i = 0; i < clue.answer.length; i++) {
                const row = clue.direction === 'down' ? clue.row + i : clue.row;
                const col = clue.direction === 'across' ? clue.col + i : clue.col;
                const key = `${row}-${col}`;
                const userAnswer = userAnswers[key] || '';
                const correctAnswer = clue.answer[i];
                if (userAnswer) {
                     checks[key] = userAnswer === correctAnswer ? 'correct' : 'incorrect';
                }
            }
        });
        setCheckedAnswers(checks);
    };
    
    const handleResetPuzzle = () => {
        setUserAnswers({});
        setCheckedAnswers(null);
        setActiveClue(null);
    };

    const handleShowAnswers = () => {
        if (!puzzleData) return;
        const correctAnswers: UserAnswers = {};
        puzzleData.clues.forEach(clue => {
            for (let i = 0; i < clue.answer.length; i++) {
                const row = clue.direction === 'down' ? clue.row + i : clue.row;
                const col = clue.direction === 'across' ? clue.col + i : clue.col;
                const key = `${row}-${col}`;
                correctAnswers[key] = clue.answer[i];
            }
        });
        setUserAnswers(correctAnswers);
        setCheckedAnswers(null);
    };

    const handlePrint = () => {
        window.print();
    };


    return (
        <>
            <div className="min-h-screen p-4 sm:p-8 font-body relative no-print">
                <div className="absolute top-4 left-4 z-10">
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as ThemeKey)}
                        className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border)] rounded-lg p-2 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition font-body"
                    >
                        {Object.entries(themes).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="absolute top-4 right-4 z-10 p-2 border-2 border-yellow-400 bg-white text-black rounded-md font-semibold text-sm shadow-lg">
                    MoonCreaciones🌙
                </div>

                <div className="max-w-7xl mx-auto">
                    <header className="text-center mb-8 pt-12">
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[var(--header-gradient-start)] via-[var(--header-gradient-mid)] to-[var(--header-gradient-end)] font-display uppercase"
                            style={{ textShadow: '0 0 15px var(--color-accent-muted), 0 0 10px var(--color-primary-muted)'}}
                        >
                            AI Crossword Generator
                        </h1>
                        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
                            Generate puzzles from any text or document.
                        </p>
                    </header>
                    
                    <main>
                        <TopicForm onGenerate={handleGenerate} isLoading={isLoading} />

                        {isLoading && <LoadingSpinner />}
                        {error && <div className="text-center p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-500/50">{error}</div>}

                        {puzzleData && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
                                <div className="lg:col-span-3">
                                    <CrosswordGrid 
                                        puzzleData={puzzleData} 
                                        userAnswers={userAnswers} 
                                        onAnswerChange={handleAnswerChange}
                                        activeClue={activeClue}
                                        onCellSelect={handleCellSelect}
                                        checkedAnswers={checkedAnswers}
                                    />
                                    <div className="flex items-center justify-center flex-wrap gap-4 mt-6">
                                        <button onClick={handleCheckPuzzle} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-[var(--color-correct)] font-bold py-2 px-4 rounded-lg transition-colors border border-lime-500/50 shadow-lg shadow-lime-500/10">
                                            <CheckIcon className="w-5 h-5"/>
                                            Corregir
                                        </button>
                                        <button onClick={handleShowAnswers} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold py-2 px-4 rounded-lg transition-colors border border-yellow-500/50 shadow-lg shadow-yellow-500/10">
                                            <LightbulbIcon className="w-5 h-5"/>
                                            Ver Respuestas
                                        </button>
                                        <button onClick={handleResetPuzzle} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-[var(--color-accent)] font-bold py-2 px-4 rounded-lg transition-colors border border-pink-500/50 shadow-lg shadow-pink-500/10">
                                            <ArrowPathIcon className="w-5 h-5"/>
                                            Reiniciar
                                        </button>
                                        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-[var(--color-primary)] font-bold py-2 px-4 rounded-lg transition-colors border border-cyan-500/50 shadow-lg shadow-cyan-500/10">
                                            <PrinterIcon className="w-5 h-5"/>
                                            Imprimir
                                        </button>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 bg-[var(--color-surface-1)] p-4 rounded-xl border border-[var(--color-primary-muted)]">
                                    <ClueList 
                                        clues={puzzleData.clues}
                                        activeClue={activeClue}
                                        onClueSelect={setActiveClue}
                                    />
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {puzzleData && <PrintLayout puzzleData={puzzleData} />}
        </>
    );
};

export default App;