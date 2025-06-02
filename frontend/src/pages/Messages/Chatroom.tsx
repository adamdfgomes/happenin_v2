import React, { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import Background from '../../components/Background';
import Message from '../../components/Message';

interface ChatMessage {
  id: number;
  text: string;
  isMine: boolean;
  timestamp: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hey there! Ready to play?", isMine: false, timestamp: "10:30 AM" },
    { id: 2, text: "Absolutely! Let's do this!", isMine: true, timestamp: "10:31 AM" },
    { id: 3, text: "What game should we start with?", isMine: false, timestamp: "10:31 AM" },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages([...messages, {
      id: messages.length + 1,
      text: newMessage,
      isMine: true,
      timestamp
    }]);
    setNewMessage('');
  };

  return (
    <Background>
      <Header title="Team Chat" />
      
      <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map((message) => (
            <Message
              key={message.id}
              text={message.text}
              isMine={message.isMine}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-green-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full bg-green-900/50 border-2 border-green-600 focus:border-green-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </Background>
  );
};

export default ChatRoom;