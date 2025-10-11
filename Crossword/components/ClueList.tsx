import React from 'react';
import type { Clue } from '../types';

interface ClueListProps {
  clues: Clue[];
  activeClue: Clue | null;
  onClueSelect: (clue: Clue) => void;
}

const ClueList: React.FC<ClueListProps> = ({ clues, activeClue, onClueSelect }) => {
  const acrossClues = clues.filter(c => c.direction === 'across').sort((a,b) => a.number - b.number);
  const downClues = clues.filter(c => c.direction === 'down').sort((a,b) => a.number - b.number);

  const renderClue = (clue: Clue) => {
    const isActive = activeClue?.number === clue.number && activeClue?.direction === clue.direction;
    return (
      <li
        key={`${clue.direction}-${clue.number}`}
        onClick={() => onClueSelect(clue)}
        className={`cursor-pointer p-2 rounded-md transition-all duration-200 text-[var(--color-text-muted)] font-body ${isActive ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-2 ring-[var(--color-accent)]' : 'hover:bg-slate-800/70'}`}
      >
        <span className="font-bold mr-2 text-[var(--color-primary)]">{clue.number}.</span>
        {clue.clue}
      </li>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 w-full font-body">
      <div>
        <h3 className="text-2xl font-bold font-display text-[var(--color-primary)] border-b-2 border-[var(--color-primary-muted)] pb-2 mb-3 tracking-widest">ACROSS</h3>
        <ul className="space-y-1 pr-2 max-h-64 md:max-h-96 lg:max-h-64 overflow-y-auto">
          {acrossClues.map(renderClue)}
        </ul>
      </div>
      <div className="mt-0 md:mt-0 lg:mt-6">
        <h3 className="text-2xl font-bold font-display text-[var(--color-primary)] border-b-2 border-[var(--color-primary-muted)] pb-2 mb-3 tracking-widest">DOWN</h3>
        <ul className="space-y-1 pr-2 max-h-64 md:max-h-96 lg:max-h-64 overflow-y-auto">
          {downClues.map(renderClue)}
        </ul>
      </div>
    </div>
  );
};

export default ClueList;