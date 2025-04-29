import React, { useState } from 'react';
import randomizeWheel from '../utils/randomizeWheel';
import Button from './Button';

interface WheelProps {
  options: string[];
  onSelect: (option: string) => void;
}

const Wheel: React.FC<WheelProps> = ({ options, onSelect }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const segmentAngle = 360 / options.length;

  const handleSpin = () => {
    if (spinning) return;
    const selected = randomizeWheel(options);
    const idx = options.indexOf(selected);
    const fullSpins = 5;
    const finalAngle = fullSpins * 360 + (360 - idx * segmentAngle - segmentAngle / 2);
    setRotation(finalAngle);
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      onSelect(selected);
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="w-64 h-64 rounded-full border-4 border-gray-300 transition-transform duration-[5000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {options.map((opt, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                key={opt}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${angle}deg) translate(0, -120px) rotate(-${angle}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <span className="block w-24 text-center text-sm">{opt}</span>
              </div>
            );
          })}
        </div>
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
          <div className="triangle-up" />
        </div>
      </div>
      <Button onClick={handleSpin} disabled={spinning} className="mt-4">
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>
    </div>
  );
};

export default Wheel;
