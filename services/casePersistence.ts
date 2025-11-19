import type { Case, Message } from '../types';
import { Role } from '../types';

const STORAGE_KEY = 'casePrepAiTutorSession';

// A version of the Message type where the timestamp is a string for JSON compatibility.
interface SerializableMessage {
  role: Role;
  text: string;
  timestamp: string; // ISO string
}

interface SavedState {
  selectedCase: Case;
  chatHistory: SerializableMessage[];
  elapsedTime: number;
}

/**
 * Saves the current case state to localStorage.
 * @param selectedCase The currently selected case.
 * @param chatHistory The current chat history.
 * @param elapsedTime The elapsed time in seconds for the current case.
 */
export function saveCaseState(selectedCase: Case, chatHistory: Message[], elapsedTime: number): void {
  try {
    const serializableHistory = chatHistory.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    const state: SavedState = { selectedCase, chatHistory: serializableHistory, elapsedTime };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save case state:", error);
  }
}

/**
 * Loads the case state from localStorage.
 * @returns The saved case, chat history, and elapsed time, or null if nothing is saved.
 */
export function loadCaseState(): { selectedCase: Case; chatHistory: Message[]; elapsedTime: number } | null {
  try {
    const savedStateJSON = localStorage.getItem(STORAGE_KEY);
    if (!savedStateJSON) return null;

    const savedState: SavedState = JSON.parse(savedStateJSON);
    
    // Convert timestamp strings back to Date objects
    const chatHistory = savedState.chatHistory.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
    
    return { 
      selectedCase: savedState.selectedCase, 
      chatHistory,
      elapsedTime: savedState.elapsedTime || 0 // Default to 0 if not present
    };
  } catch (error) {
    console.error("Failed to load case state:", error);
    // If loading fails, clear the invalid state
    clearCaseState();
    return null;
  }
}

/**
 * Clears the saved case state from localStorage.
 */
export function clearCaseState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear case state:", error);
  }
}