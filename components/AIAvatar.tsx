import React from 'react';

type MouthShape = 'neutral' | 'A' | 'O' | 'E';

interface AIAvatarProps extends React.SVGProps<SVGSVGElement> {
  isSpeaking: boolean;
  mouthShape: MouthShape;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ isSpeaking, mouthShape, ...props }) => {
  const mouthPaths = {
    neutral: "M 42 75 C 45 78, 55 78, 58 75",
    A: "M 42 74 C 45 82, 55 82, 58 74 Q 50 83 42 74 Z",
    O: "M 48 75 C 47 79, 53 79, 52 75 C 53 71, 47 71, 48 75 Z",
    E: "M 40 76 L 60 76 L 58 79 L 42 79 Z",
  };

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>
        {`
          @keyframes slow-glow-case-prep {
            from { filter: drop-shadow(0 0 4px #e94560); opacity: 0.7; }
            to { filter: drop-shadow(0 0 10px #e94560); opacity: 1; }
          }
          @keyframes speaking-glow-case-prep {
            from { filter: drop-shadow(0 0 8px #e94560); opacity: 0.8; }
            to { filter: drop-shadow(0 0 16px #e94560); opacity: 1; }
          }
          .glow-container-case-prep {
            animation: slow-glow-case-prep 4s infinite alternate ease-in-out;
          }
          .glow-container-case-prep.speaking {
            animation: speaking-glow-case-prep 1.5s infinite alternate ease-in-out;
          }
          @keyframes blink-case-prep {
            0%, 95%, 100% { transform: scaleY(1); }
            97.5% { transform: scaleY(0.1); }
          }
          .eye-lid-case-prep {
            animation: blink-case-prep 5s infinite;
            transform-origin: center;
          }
        `}
      </style>
      <defs>
        <radialGradient id="face-gradient" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
          <stop offset="0%" stopColor="#16213e" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id="eye-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#e94560" />
        </linearGradient>
      </defs>

      <g className={`glow-container-case-prep ${isSpeaking ? 'speaking' : ''}`}>
        {/* Head */}
        <path d="M 50, 98 C 23.49, 98 2, 76.51 2, 50 2, 23.49 23.49, 2 50, 2 c 26.51, 0 48, 21.49 48, 48 0, 26.51 -21.49, 48 -48, 48 z" fill="url(#face-gradient)" />
        <path d="M 50, 98 C 23.49, 98 2, 76.51 2, 50 2, 23.49 23.49, 2 50, 2 c 26.51, 0 48, 21.49 48, 48 0, 26.51 -21.49, 48 -48, 48 z" stroke="#e94560" strokeOpacity="0.3" strokeWidth="1" />
        
        {/* Eyes */}
        <g className="eye-lid-case-prep">
            <ellipse cx="35" cy="50" rx="6" ry="10" fill="url(#eye-gradient)" />
            <ellipse cx="65" cy="50" rx="6" ry="10" fill="url(#eye-gradient)" />
            {/* Pupils */}
            <circle cx="35" cy="52" r="2" fill="#1a1a2e" />
            <circle cx="65" cy="52" r="2" fill="#1a1a2e" />
            {/* Highlights */}
            <circle cx="36" cy="47" r="1.5" fill="white" fillOpacity="0.8" />
            <circle cx="66" cy="47" r="1.5" fill="white" fillOpacity="0.8" />
        </g>
        
        {/* Mouth */}
        <path 
            d={mouthPaths[mouthShape]} 
            stroke="#dcdcdc" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
            style={{ transition: 'd 0.1s ease-in-out' }}
        />
      </g>
    </svg>
  );
};
