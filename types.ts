
export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  role: Role;
  text: string;
  timestamp: Date;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  category: string;
  initialPrompt: string;
}
