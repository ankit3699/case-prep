import React from 'react';
import type { Case } from '../types';

interface SidebarProps {
  cases: Case[];
  selectedCase: Case | null;
  onSelectCase: (caseItem: Case) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  resumableCase: Case | null;
  onResumeCase: () => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ cases, selectedCase, onSelectCase, isOpen, setIsOpen, resumableCase, onResumeCase }) => {
  const categories = [...new Set(cases.map(c => c.category))];

  return (
    <>
      <aside className={`absolute z-20 h-full w-72 transform bg-secondary shadow-lg transition-transform duration-300 ease-in-out md:static md:z-auto md:h-auto md:w-72 md:flex-shrink-0 md:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-accent px-4">
            <h2 className="text-lg font-semibold text-light">Case Library</h2>
             <button onClick={() => setIsOpen(false)} className="text-light md:hidden">
                <CloseIcon className="h-6 w-6"/>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            {resumableCase && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-400">In Progress</h3>
                <ul>
                  <li>
                    <button
                      onClick={onResumeCase}
                      className={`w-full rounded-md p-3 text-left transition-colors duration-200 ${selectedCase?.id === resumableCase.id ? 'bg-accent text-white ring-2 ring-highlight' : 'hover:bg-accent/50 text-light border-2 border-dashed border-highlight/50'}`}
                    >
                      <p className="font-semibold">{resumableCase.title}</p>
                      <p className="text-xs text-gray-400">Click to resume your session.</p>
                    </button>
                  </li>
                </ul>
              </div>
            )}
            {categories.map(category => (
              <div key={category} className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase text-highlight">{category}</h3>
                <ul>
                  {cases.filter(c => c.category === category).map(caseItem => (
                    <li key={caseItem.id}>
                      <button
                        onClick={() => onSelectCase(caseItem)}
                        className={`w-full rounded-md p-3 text-left transition-colors duration-200 ${selectedCase?.id === caseItem.id ? 'bg-accent text-white' : 'hover:bg-accent/50 text-light'}`}
                      >
                        <p className="font-semibold">{caseItem.title}</p>
                        <p className="text-xs text-gray-400">{caseItem.description}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-10 bg-black/50 md:hidden"></div>}
    </>
  );
};

export default Sidebar;
