import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon } from './icons/UserIcon';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const containerClasses = `flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-xl rounded-xl p-4 text-light ${isUser ? 'bg-highlight rounded-br-none' : 'bg-secondary rounded-tl-none'}`;
  
  return (
    <div className={containerClasses}>
       {/* AI Avatar is now a single portrait in ChatWindow, so it's not rendered here. */}
      <div className={bubbleClasses}>
        <p className="text-sm sm:text-base whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUser && (
         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white font-bold shrink-0">
          <UserIcon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
