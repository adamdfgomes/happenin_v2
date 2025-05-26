import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import SelectionButton from '../../components/TwoTruthsOneLie/SelectionButton';
import Button from '../../components/Button';

const TTOLanswers: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleClick = (index: number) => {
    setSelectedIndex(prev => prev === index ? null : index);
  };

  const handleSubmit = () => {
    console.log('Selected lie index:', selectedIndex);
    navigate('/ttol/1/results'); // TODO: change to sessionId
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Select the lie 🤫" />
      <div className="w-full max-w-2xl space-y-4 mt-8">
        <SelectionButton
          label="First statement" // TODO: change to the actual statement
          selected={selectedIndex === 0}
          onClick={() => handleClick(0)}
        />
        <SelectionButton
          label="Second statement" // TODO: change to the actual statement
          selected={selectedIndex === 1}
          onClick={() => handleClick(1)}
        />
        <SelectionButton
          label="Third statement" // TODO: change to the actual statement
          selected={selectedIndex === 2}
          onClick={() => handleClick(2)}
        />
        {selectedIndex !== null && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleSubmit} className="text-xl px-8 py-3">
              Submit Selection
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default TTOLanswers;
