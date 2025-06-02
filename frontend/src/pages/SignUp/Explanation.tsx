import React from 'react';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Background from '../../components/Background';
import { useNavigate } from 'react-router-dom';

const Explanation: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Write your team fact file",
      description: "Create your team's profile with fun facts and truths"
    },
    {
      number: 2,
      title: "Game 1",
      description: "Start with an exciting first game"
    },
    {
      number: 3,
      title: "Learn something about your opposition",
      description: "Discover interesting facts about the other team"
    },
    {
      number: 4,
      title: "Game 2",
      description: "Continue the fun with another game"
    }, 
    {
      number: 5,
      title: "Send a message to them",
      description: "Share your thoughts and reactions"
    },
    {
      number: 6,
      title: "Game 3",
      description: "One more game to test your connection"
    },
    {
      number: 7,
      title: "Go wild!",
      description: "Play more games, get chatting, buy them a drink, share your table number, make a new mate, sort out your next date"
    }
  ];

  return (
    <Background>
      <Header title="How it works" />
      
      <div className="w-full max-w-2xl mt-2 space-y-1 flex-1 overflow-hidden">
        {steps.map((step) => (
          <div 
            key={step.number}
            className="flex items-start gap-2 p-1.5 bg-green-800/50 rounded-lg transition-transform hover:scale-[1.02]"
          >
            {/* Step Number */}
            <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center font-bold text-xs">
              {step.number}
            </div>
            
            {/* Step Content */}
            <div>
              <h3 className="text-base font-bold leading-tight">{step.title}</h3>
              <p className="text-xs text-green-100 leading-tight">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <div className="mt-2 mb-2">
        <Button onClick={() => navigate('/group')}>
          Let's get started!
        </Button>
      </div>
    </Background>
  );
};

export default Explanation; 
