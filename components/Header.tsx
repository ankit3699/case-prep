import React from 'react';
import type { Case } from '../types';
import { SpeakerOnIcon } from './icons/SpeakerOnIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { ClockIcon } from './icons/ClockIcon';

interface HeaderProps {
  selectedCase: Case | null;
  onMenuClick: () => void;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (enabled: boolean) => void;
  elapsedTime: number;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ selectedCase, onMenuClick, isTtsEnabled, setIsTtsEnabled, elapsedTime }) => {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <header className="flex h-16 w-full flex-shrink-0 items-center justify-between border-b border-accent bg-secondary px-4 sm:px-6">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="mr-4 text-light md:hidden">
          <MenuIcon className="h-6 w-6"/>
        </button>
        <h1 className="text-xl font-bold text-highlight">Case Prep AI Tutor</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <h2 className="text-sm font-medium text-light truncate sm:text-base">
            {selectedCase ? selectedCase.title : 'Select a Case to Begin'}
          </h2>
          <p className="text-xs text-gray-400">{selectedCase?.category}</p>
        </div>
        {selectedCase && (
          <div className="hidden sm:flex items-center gap-2 text-light bg-accent/50 px-3 py-1 rounded-full">
            <ClockIcon className="h-5 w-5" />
            <span className="font-mono text-sm font-semibold tracking-wider">{formatTime(elapsedTime)}</span>
          </div>
        )}
        <button
          onClick={() => setIsTtsEnabled(!isTtsEnabled)}
          className="rounded-full p-2 text-light transition-colors hover:bg-accent"
          aria-label={isTtsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
          title={isTtsEnabled ? 'Disable Speech Output' : 'Enable Speech Output'}
        >
          {isTtsEnabled ? <SpeakerOnIcon className="h-6 w-6" /> : <SpeakerOffIcon className="h-6 w-6" />}
        </button>
      </div>
    </header>
  );
};

export default Header;