import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const InterGameMessage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();

  const suggestions = [
    "Introduce yourself?",
    "Make them laugh then you boring cunt",
    "Share a fun fact about your team",
    "Challenge them to the next game",
    "Ask them a question"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    // TODO: Handle message submission
    navigate('/messagereceive/1'); // TODO: change to sessionId
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center text-white p-4">
      <Header title="Send a message" />
      
      {/* Timer */}
      <div className="absolute top-4 right-4 text-2xl font-bold">
        {timeLeft}s
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-2xl mt-8 flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-full text-sm transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Message Input */}
      <div className="w-full max-w-2xl mt-8">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 300))}
          placeholder="Type your message here..."
          className="w-full h-48 p-4 rounded-lg bg-green-800/50 border-2 border-green-600 focus:border-green-400 focus:outline-none resize-none"
        />
        <div className="text-right mt-2 text-sm">
          {message.length}/300 characters
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <Button 
          onClick={handleSubmit}
          disabled={message.length === 0}
        >
          Send Message
        </Button>
      </div>
    </main>
  );
};

export default InterGameMessage; 
