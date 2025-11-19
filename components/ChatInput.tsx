import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Fix for SpeechRecognition API not being in standard TS DOM types
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onSendMessageRef = useRef(onSendMessage);
  onSendMessageRef.current = onSendMessage;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    setIsSpeechRecognitionSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop when user pauses
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      finalTranscript = '';
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        onSendMessageRef.current(finalTranscript.trim());
        setInput('');
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array, runs once on mount

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
        recognitionRef.current.stop();
    } else {
        setInput(''); // Clear input before starting
        recognitionRef.current.start();
    }
  };


  return (
    <div className="mt-auto flex-shrink-0 bg-secondary/50 p-4 border-t border-accent">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : "Type your response here..."}
          disabled={isLoading || isRecording}
          rows={1}
          className="w-full resize-none rounded-full border border-accent bg-primary py-3 pl-5 pr-24 text-light placeholder-gray-500 focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight disabled:opacity-50"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isSpeechRecognitionSupported && (
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`rounded-full p-2 text-light transition-all duration-300 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${isRecording ? 'bg-red-600 animate-pulse ring-2 ring-red-400 ring-offset-2 ring-offset-primary' : 'bg-gray-600 hover:bg-gray-500'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    <MicrophoneIcon className="h-5 w-5" />
                </button>
            )}
            <button
                type="submit"
                disabled={isLoading || !input.trim() || isRecording}
                className="rounded-full p-2 text-light transition-colors enabled:bg-highlight enabled:hover:bg-highlight/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <SendIcon className="h-5 w-5" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;