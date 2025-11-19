import React, { useRef, useEffect, useState } from 'react';
import MessageComponent from './Message';
import type { Message, Case } from '../types';
import { Role } from '../types';
import { AIAvatar } from './AIAvatar';

type MouthShape = 'neutral' | 'A' | 'O' | 'E';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  selectedCase: Case | null;
  isTtsEnabled: boolean;
}

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-48 h-48 mb-6">
            <AIAvatar isSpeaking={false} mouthShape="neutral" />
        </div>
        <h2 className="text-3xl font-bold text-highlight mb-4">Welcome to Case Prep AI Tutor</h2>
        <p className="text-lg text-gray-300 max-w-2xl">
            Sharpen your consulting skills with interactive case studies powered by AI. Select a case from the library on the left to begin your practice interview. Good luck!
        </p>
    </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, selectedCase, isTtsEnabled }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthShape, setMouthShape] = useState<MouthShape>('neutral');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, messages[messages.length - 1]?.text]);

  // Effect for Text-to-Speech and Lip-Sync
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (!isTtsEnabled || !lastMessage || lastMessage.role !== Role.AI || !lastMessage.text.trim()) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setMouthShape('neutral');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(lastMessage.text);
    utterance.rate = 2.0; // Set speed to 2x
    
    const visemeCycle: MouthShape[] = ['A', 'E', 'O', 'A', 'E', 'O'];
    let visemeIndex = 0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
          setMouthShape(visemeCycle[visemeIndex]);
          visemeIndex = (visemeIndex + 1) % visemeCycle.length;
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setMouthShape('neutral');
    };
    
    utterance.onerror = () => {
        setIsSpeaking(false);
        setMouthShape('neutral');
    };

    // Cancel any previous speech and start the new one
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    // Cleanup when component unmounts or dependencies change
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setMouthShape('neutral');
    }
  }, [messages, isTtsEnabled, selectedCase]);


  if (!selectedCase) {
      return <WelcomeScreen />;
  }

  return (
    <div className="flex h-full flex-col lg:flex-row p-4 sm:p-6 gap-6">
        {/* Avatar Section */}
        <div className="flex-shrink-0 w-full lg:w-1/3 xl:w-1/4 flex items-center justify-center p-4">
            <div className="w-48 h-48 lg:w-full lg:h-auto lg:max-w-xs">
                 <AIAvatar isSpeaking={isSpeaking} mouthShape={mouthShape} />
            </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto pb-4 pr-2">
                {messages.map((msg, index) => (
                    (msg.role === 'user' || msg.text) ? <MessageComponent key={index} message={msg} /> : null
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    </div>
  );
};

export default ChatWindow;
