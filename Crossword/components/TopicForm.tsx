import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

const MAX_CHARS = 8000;

export interface GenerateOptions {
    source: 'text' | 'file' | 'ai';
    content: string;
    wordCount: string;
    difficulty: string;
    language: 'English' | 'Spanish';
}

interface TopicFormProps {
    onGenerate: (options: GenerateOptions) => void;
    isLoading: boolean;
}

type InputMode = 'text' | 'file' | 'ai';

const TopicForm: React.FC<TopicFormProps> = ({ onGenerate, isLoading }) => {
    const [mode, setMode] = useState<InputMode>('text');
    const [textContent, setTextContent] = useState<string>('');
    const [aiTopic, setAiTopic] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [wordCount, setWordCount] = useState<string>('15-20');
    const [difficulty, setDifficulty] = useState<string>('Medium');
    const [language, setLanguage] = useState<'English' | 'Spanish'>('English');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setTextContent(result);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;

        const baseOptions = { wordCount, difficulty, language };
        if (mode === 'ai' && aiTopic.trim()) {
            onGenerate({ source: 'ai', content: aiTopic.trim(), ...baseOptions });
        } else if (textContent.trim() && textContent.length <= MAX_CHARS) {
            onGenerate({ source: 'text', content: textContent.trim(), ...baseOptions });
        }
    };

    const isTextModeInvalid = (mode === 'text' || mode === 'file') && (!textContent.trim() || textContent.length > MAX_CHARS);
    const isAiModeInvalid = mode === 'ai' && !aiTopic.trim();
    const isSubmitDisabled = isLoading || isTextModeInvalid || isAiModeInvalid;
    
    const isOverLimit = textContent.length > MAX_CHARS;

    const activeTabClass = 'bg-[var(--color-primary)] text-white shadow-lg';
    const inactiveTabClass = 'bg-slate-800/60 hover:bg-slate-700/80';

    return (
        <div className="w-full mb-8 p-6 bg-[var(--color-surface-1)] backdrop-blur-sm border border-[var(--color-primary-muted)] rounded-xl shadow-2xl shadow-cyan-500/10">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="language" className="block mb-2 text-sm font-medium text-[var(--color-text-muted)] font-body">Language</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'English' | 'Spanish')}
                            disabled={isLoading}
                            className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition font-body"
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Español</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="word-count" className="block mb-2 text-sm font-medium text-[var(--color-text-muted)] font-body">Number of Words</label>
                        <select
                            id="word-count"
                            value={wordCount}
                            onChange={(e) => setWordCount(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition font-body"
                        >
                            <option value="10-15">Small (10-15)</option>
                            <option value="15-20">Medium (15-20)</option>
                            <option value="20-25">Large (20-25)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="difficulty" className="block mb-2 text-sm font-medium text-[var(--color-text-muted)] font-body">Difficulty</label>
                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-lg p-2.5 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition font-body"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div className="flex mb-4 border-2 border-[var(--color-border)] rounded-lg p-1">
                    <button type="button" onClick={() => setMode('text')} className={`flex-1 p-2 rounded-md transition-all font-bold ${mode === 'text' ? activeTabClass : inactiveTabClass}`}>
                        Paste Text
                    </button>
                    <button type="button" onClick={() => setMode('file')} className={`flex-1 p-2 rounded-md transition-all font-bold ${mode === 'file' ? activeTabClass : inactiveTabClass}`}>
                        Upload File
                    </button>
                     <button type="button" onClick={() => setMode('ai')} className={`flex-1 p-2 rounded-md transition-all font-bold ${mode === 'ai' ? activeTabClass : inactiveTabClass}`}>
                        Generate with AI
                    </button>
                </div>

                {mode === 'text' && (
                    <div>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Paste your article, story, or any block of text here..."
                            className={`w-full h-48 bg-[var(--color-surface-2)] border-2 rounded-lg p-4 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition font-body ${isOverLimit ? 'border-red-500/70' : 'border-[var(--color-border)]'}`}
                            disabled={isLoading}
                        />
                         <div className="text-right text-xs mt-1 pr-1">
                            <span className={isOverLimit ? 'text-red-400 font-bold' : 'text-[var(--color-text-muted)]'}>
                                {textContent.length} / {MAX_CHARS}
                            </span>
                        </div>
                    </div>
                )}
                {mode === 'file' && (
                    <div>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-[var(--color-border)] border-dashed rounded-lg cursor-pointer bg-[var(--color-surface-2)] hover:bg-slate-800/80 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                    <p className="mb-2 text-sm text-[var(--color-text-muted)]"><span className="font-semibold text-[var(--color-primary)]">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500">.TXT file</p>
                                    {fileName && <p className="text-xs text-[var(--color-accent)] mt-2">{fileName}</p>}
                                </div>
                                <input id="file-upload" type="file" className="hidden" accept=".txt" onChange={handleFileChange} disabled={isLoading} />
                            </label>
                        </div>
                         <div className="text-right text-xs mt-1 pr-1">
                            <span className={isOverLimit ? 'text-red-400 font-bold' : 'text-[var(--color-text-muted)]'}>
                                {textContent.length} / {MAX_CHARS}
                            </span>
                        </div>
                    </div>
                )}
                {mode === 'ai' && (
                     <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="Enter a topic, e.g., 'Ancient Egypt' or 'Space Exploration'"
                        className="w-full h-48 bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-lg p-4 text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition font-body text-center text-lg"
                        disabled={isLoading}
                    />
                )}
                
                <div className="mt-6 flex justify-center">
                     <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="flex items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-1 disabled:transform-none"
                    >
                        <SparklesIcon className="w-6 h-6" />
                        <span className="text-lg">{isLoading ? 'Generating...' : 'Generate Crossword'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TopicForm;