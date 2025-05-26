import React from 'react';

interface MessageProps {
  text: string;
  isMine: boolean;
  timestamp?: string;
}

const Message: React.FC<MessageProps> = ({ text, isMine, timestamp }) => {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`relative max-w-[70%] ${isMine ? 'ml-4' : 'mr-4'}`}>
        {/* Speech Bubble */}
        <div className={`rounded-2xl px-4 py-2 ${
          isMine 
            ? 'bg-green-600 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
        }`}>
          <p className="text-sm">{text}</p>
        </div>
        
        {/* Speech Bubble Tail */}
        <div className={`absolute top-0 w-0 h-0 ${
          isMine 
            ? 'right-[-8px] border-l-[8px] border-l-green-600 border-t-[8px] border-t-green-600 border-r-[8px] border-r-transparent border-b-[8px] border-b-transparent' 
            : 'left-[-8px] border-l-[8px] border-l-transparent border-t-[8px] border-t-gray-200 border-r-[8px] border-r-transparent border-b-[8px] border-b-transparent'
        }`} />
        
        {/* Timestamp */}
        {timestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message; 
