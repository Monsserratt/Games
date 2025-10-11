import React, { useRef, useEffect, useMemo } from 'react';
import type { PuzzleData, Clue, UserAnswers, CheckedAnswers } from '../types';

interface CrosswordGridProps {
    puzzleData: PuzzleData;
    userAnswers: UserAnswers;
    onAnswerChange: (row: number, col: number, value: string) => void;
    activeClue: Clue | null;
    onCellSelect: (row: number, col: number) => void;
    checkedAnswers: CheckedAnswers | null;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
    puzzleData,
    userAnswers,
    onAnswerChange,
    activeClue,
    onCellSelect,
    checkedAnswers,
}) => {
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const { gridLayout, clueStarts } = useMemo(() => {
        const layout: (number | null)[][] = Array(puzzleData.gridSize).fill(null).map(() => Array(puzzleData.gridSize).fill(null));
        const starts: { [key: string]: number } = {};

        puzzleData.clues.forEach(clue => {
            starts[`${clue.row}-${clue.col}`] = clue.number;
            for (let i = 0; i < clue.answer.length; i++) {
                if (clue.direction === 'across') {
                    layout[clue.row][clue.col + i] = 1;
                } else {
                    layout[clue.row + i][clue.col] = 1;
                }
            }
        });
        return { gridLayout: layout, clueStarts: starts };
    }, [puzzleData]);

    useEffect(() => {
        if (activeClue) {
            const firstEmptyCell = findFirstEmptyCell(activeClue);
            const key = firstEmptyCell ? `${firstEmptyCell.row}-${firstEmptyCell.col}` : `${activeClue.row}-${activeClue.col}`;
            inputRefs.current[key]?.focus();
            inputRefs.current[key]?.select();
        }
    }, [activeClue]);

    const findFirstEmptyCell = (clue: Clue) => {
        for (let i = 0; i < clue.answer.length; i++) {
            const row = clue.direction === 'down' ? clue.row + i : clue.row;
            const col = clue.direction === 'across' ? clue.col + i : clue.col;
            if (!userAnswers[`${row}-${col}`]) {
                return { row, col };
            }
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
        const value = e.target.value.toUpperCase().slice(-1);
        onAnswerChange(row, col, value);

        if (value && activeClue) {
            const { direction, answer } = activeClue;
            const currentIndex = direction === 'across' ? col - activeClue.col : row - activeClue.row;

            if (currentIndex < answer.length - 1) {
                const nextRow = direction === 'down' ? row + 1 : row;
                const nextCol = direction === 'across' ? col + 1 : col;
                inputRefs.current[`${nextRow}-${nextCol}`]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
        const key = e.key;
        if (!activeClue) return;

        let nextRow = row, nextCol = col;

        switch(key) {
            case 'ArrowUp':
                e.preventDefault();
                nextRow = row > 0 ? row - 1 : row;
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextRow = row < puzzleData.gridSize - 1 ? row + 1 : row;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                nextCol = col > 0 ? col - 1 : col;
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextCol = col < puzzleData.gridSize - 1 ? col + 1 : col;
                break;
            case 'Backspace':
                if (!userAnswers[`${row}-${col}`]) {
                    e.preventDefault();
                    if (activeClue.direction === 'across') {
                        nextCol = col > 0 ? col - 1 : col;
                    } else {
                        nextRow = row > 0 ? row - 1 : row;
                    }
                }
                break;
            default:
                return;
        }
        
        const nextRef = inputRefs.current[`${nextRow}-${nextCol}`];
        if (nextRef) {
            nextRef.focus();
            nextRef.select();
        }
    };
    
    return (
        <div className="bg-[var(--color-surface-1)] p-2 sm:p-4 rounded-xl shadow-lg border border-[var(--color-primary-muted)] aspect-square max-w-full mx-auto">
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${puzzleData.gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${puzzleData.gridSize}, minmax(0, 1fr))`,
                    gap: '2px',
                }}
            >
                {gridLayout.map((rowArr, rowIndex) =>
                    rowArr.map((cell, colIndex) => {
                        const key = `${rowIndex}-${colIndex}`;
                        if (cell === null) {
                            return <div key={key} className="bg-black/50 rounded-sm" />;
                        }

                        const clueNumber = clueStarts[key];
                        const isActiveClue = activeClue && (
                            activeClue.direction === 'across' && activeClue.row === rowIndex && colIndex >= activeClue.col && colIndex < activeClue.col + activeClue.answer.length ||
                            activeClue.direction === 'down' && activeClue.col === colIndex && rowIndex >= activeClue.row && rowIndex < activeClue.row + activeClue.answer.length
                        );
                        
                        const checkStatus = checkedAnswers ? checkedAnswers[key] : null;
                        
                        const cellBg = isActiveClue ? 'bg-[var(--color-accent-muted)]' : 'bg-[var(--color-surface-2)]';
                        
                        let textColor = 'text-[var(--color-text-base)]';
                        if (checkStatus === 'correct') {
                            textColor = 'text-[var(--color-correct)]';
                        } else if (checkStatus === 'incorrect') {
                            textColor = 'text-[var(--color-incorrect)]';
                        }
                        
                        return (
                            <div key={key} className={`relative aspect-square ${cellBg} flex items-center justify-center rounded-sm transition-colors`}>
                                {clueNumber && (
                                    <span className="absolute top-0 left-0.5 text-xs text-[var(--color-primary)] font-light" style={{fontSize: 'min(1.5vh, 10px)'}}>
                                        {clueNumber}
                                    </span>
                                )}
                                <input
                                    ref={el => { inputRefs.current[key] = el; }}
                                    type="text"
                                    maxLength={1}
                                    onClick={() => onCellSelect(rowIndex, colIndex)}
                                    onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                    value={userAnswers[key] || ''}
                                    className={`crossword-input w-full h-full text-center uppercase font-bold bg-transparent rounded-sm ${textColor} focus:ring-2 focus:ring-[var(--color-accent)]`}
                                    style={{fontSize: 'min(4vh, 20px)'}}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CrosswordGrid;