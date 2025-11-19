import React, { useState, useCallback, useEffect } from 'react';
import type { Chat } from '@google/genai';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import { CASES } from './constants';
import { startCaseChat, sendMessageToAI, sendMessageToAIStream, resumeCaseChat } from './services/geminiService';
import { saveCaseState, loadCaseState, clearCaseState } from './services/casePersistence';
import type { Case, Message } from './types';
import { Role } from './types';

const App: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [resumableCase, setResumableCase] = useState<Case | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);


  const loadAndResumeCase = useCallback((caseToResume: Case, history: Message[], time: number) => {
    setSelectedCase(caseToResume);
    setChatHistory(history);
    setElapsedTime(time);
    setIsTimerRunning(true);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    try {
      const chat = resumeCaseChat(caseToResume.initialPrompt, history);
      setChatInstance(chat);
    } catch (error) {
       console.error("Failed to resume case:", error);
      const errorMessage: Message = {
        role: Role.AI,
        text: "Sorry, I encountered an error while resuming the case.",
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  }, []);

  useEffect(() => {
    // Timer effect
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    // On initial load, check for a saved case and auto-load it.
    const savedState = loadCaseState();
    if (savedState) {
        setResumableCase(savedState.selectedCase);
        loadAndResumeCase(savedState.selectedCase, savedState.chatHistory, savedState.elapsedTime);
    }

    // Hide sidebar on small screens by default
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [loadAndResumeCase]);

  // Effect to save state to localStorage whenever the active case, history, or time changes
  useEffect(() => {
    if (selectedCase && chatHistory.length > 0) {
      saveCaseState(selectedCase, chatHistory, elapsedTime);
      setResumableCase(selectedCase); // Keep resumable case in sync
    }
  }, [selectedCase, chatHistory, elapsedTime]);

  const handleSelectCase = useCallback(async (caseItem: Case) => {
    if (isLoading) return;

    // If user selects a different case than the resumable one, clear the old state.
    const savedState = loadCaseState();
    if (savedState && savedState.selectedCase.id !== caseItem.id) {
        clearCaseState();
    }
    
    setIsTimerRunning(false);
    setElapsedTime(0);
    setSelectedCase(caseItem);
    setChatHistory([]);
    setIsLoading(true);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    try {
      const chat = startCaseChat(caseItem.initialPrompt);
      setChatInstance(chat);

      const response = await sendMessageToAI(chat, `Let's begin the case: "${caseItem.title}". Please provide the opening prompt.`);
      
      const aiResponse: Message = {
        role: Role.AI,
        text: response,
        timestamp: new Date(),
      };
      setChatHistory([aiResponse]);
    } catch (error) {
      console.error("Failed to start case:", error);
      const errorMessage: Message = {
        role: Role.AI,
        text: "Sorry, I encountered an error while starting the case. Please check your API key and try again.",
        timestamp: new Date(),
      };
      setChatHistory([errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTimerRunning(true);
    }
  }, [isLoading]);
  
  const handleResumeCase = useCallback(() => {
    const savedState = loadCaseState();
    if (savedState) {
      loadAndResumeCase(savedState.selectedCase, savedState.chatHistory, savedState.elapsedTime);
    }
  }, [loadAndResumeCase]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!chatInstance || isLoading || !messageText.trim()) return;

    const userMessage: Message = {
      role: Role.USER,
      text: messageText,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage, { role: Role.AI, text: '', timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const stream = await sendMessageToAIStream(chatInstance, messageText);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage.role === Role.AI) {
            lastMessage.text += chunkText;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMessage = newHistory[newHistory.length - 1];
        if (lastMessage.role === Role.AI) {
            lastMessage.text = "I'm having trouble connecting. Please check your connection and try again.";
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatInstance, isLoading]);

  return (
    <div className="flex h-screen w-full bg-primary font-sans">
      <Sidebar 
        cases={CASES}
        selectedCase={selectedCase}
        onSelectCase={handleSelectCase}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        resumableCase={resumableCase}
        onResumeCase={handleResumeCase}
      />
      <div className="flex flex-1 flex-col transition-all duration-300">
        <Header 
          selectedCase={selectedCase} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isTtsEnabled={isTtsEnabled}
          setIsTtsEnabled={setIsTtsEnabled}
          elapsedTime={elapsedTime}
        />
        <main className="flex-1 overflow-y-auto">
          <ChatWindow
            messages={chatHistory}
            isLoading={isLoading}
            selectedCase={selectedCase}
            isTtsEnabled={isTtsEnabled}
          />
        </main>
        {selectedCase && (
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default App;