import React from 'react';
import type { PuzzleData, Clue } from '../types';
import PrintableGrid from './PrintableGrid';

interface PrintLayoutProps {
    puzzleData: PuzzleData;
}

const PrintClues: React.FC<{clues: Clue[]}> = ({clues}) => {
    const acrossClues = clues.filter(c => c.direction === 'across').sort((a,b) => a.number - b.number);
    const downClues = clues.filter(c => c.direction === 'down').sort((a,b) => a.number - b.number);
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '10pt', fontFamily: 'sans-serif' }}>
            <div>
                <h3 style={{fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '0.5rem', paddingBottom: '0.25rem'}}>ACROSS</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {acrossClues.map(c => <li key={`p-a-${c.number}`} style={{marginBottom: '0.25rem'}}><b>{c.number}.</b> {c.clue}</li>)}
                </ul>
            </div>
            <div>
                <h3 style={{fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '0.5rem', paddingBottom: '0.25rem'}}>DOWN</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {downClues.map(c => <li key={`p-d-${c.number}`} style={{marginBottom: '0.25rem'}}><b>{c.number}.</b> {c.clue}</li>)}
                </ul>
            </div>
        </div>
    );
};

const PrintLayout: React.FC<PrintLayoutProps> = ({ puzzleData }) => {
    return (
        <div id="print-container" style={{ display: 'none' }}>
            {/* Page 1: The Puzzle */}
            <div className="print-page">
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'sans-serif' }}>Crossword Puzzle</h1>
                <div style={{ marginBottom: '2rem' }}>
                    <PrintableGrid puzzleData={puzzleData} showAnswers={false} />
                </div>
                <PrintClues clues={puzzleData.clues} />
            </div>

            {/* Page 2: The Answer Key */}
            <div className="print-page">
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'sans-serif' }}>Answer Key</h1>
                 <div style={{ marginBottom: '2rem' }}>
                    <PrintableGrid puzzleData={puzzleData} showAnswers={true} />
                </div>
                <PrintClues clues={puzzleData.clues} />
            </div>
        </div>
    );
};

export default PrintLayout;
