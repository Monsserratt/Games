import React, { useMemo } from 'react';
import type { PuzzleData } from '../types';

interface PrintableGridProps {
    puzzleData: PuzzleData;
    showAnswers: boolean;
}

const PrintableGrid: React.FC<PrintableGridProps> = ({ puzzleData, showAnswers }) => {
    const { gridLayout, clueStarts, answers } = useMemo(() => {
        const layout: (string | null)[][] = Array(puzzleData.gridSize).fill(null).map(() => Array(puzzleData.gridSize).fill(null));
        const starts: { [key: string]: number } = {};
        const ans: { [key: string]: string } = {};

        puzzleData.clues.forEach(clue => {
            if (clue.row === undefined || clue.col === undefined || !clue.answer) return;
            starts[`${clue.row}-${clue.col}`] = clue.number;
            for (let i = 0; i < clue.answer.length; i++) {
                const r = clue.direction === 'across' ? clue.row : clue.row + i;
                const c = clue.direction === 'across' ? clue.col + i : clue.col;
                if (r < puzzleData.gridSize && c < puzzleData.gridSize) {
                    layout[r][c] = '';
                    ans[`${r}-${c}`] = clue.answer[i];
                }
            }
        });
        return { gridLayout: layout, clueStarts: starts, answers: ans };
    }, [puzzleData]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${puzzleData.gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${puzzleData.gridSize}, 1fr)`,
            border: '2px solid black',
            gap: '1px',
            backgroundColor: 'black',
            aspectRatio: '1 / 1'
        }}>
            {gridLayout.map((rowArr, rowIndex) =>
                rowArr.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    if (cell === null) {
                        return <div key={key} style={{ backgroundColor: 'black' }} />;
                    }
                    return (
                        <div key={key} style={{ position: 'relative', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {clueStarts[key] && (
                                <span style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '8px', color: 'black', lineHeight: '1' }}>
                                    {clueStarts[key]}
                                </span>
                            )}
                            {showAnswers && (
                                <span style={{ fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    {answers[key]}
                                </span>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};
export default PrintableGrid;
