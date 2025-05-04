import React, { useContext, useEffect, useState } from 'react';
import Header from '../components/Header';
import { GameSessionContext } from '../context/GameSessionContext'; // Import the context

const WaitingRoom: React.FC = () => {
  // Access start_time from the context
  const { startTime } = useContext(GameSessionContext) || {};

  // State to hold the remaining time
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [invalidStartTime, setInvalidStartTime] = useState<boolean>(false);

  // Update the countdown timer every second
  useEffect(() => {
    if (!startTime) return;

    // Parse the start time to a Date object
    const startDate = new Date(startTime);

    // Check if the startDate is a valid Date
    if (isNaN(startDate.getTime())) {
      setInvalidStartTime(true);
      return; // If it's not a valid date, stop the timer
    }

    // Function to update the timer
    const updateTimer = () => {
      const now = new Date();
      const difference = startDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft(0); // If the start time is in the past, set to 0
      } else {
        setTimeLeft(difference); // Otherwise, update with remaining time
      }
    };

    // Initial update
    updateTimer();

    // Set an interval to update the timer every second
    const interval = setInterval(updateTimer, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [startTime]);

  // If startTime is not set or invalid, show an error message
  if (!startTime || invalidStartTime) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex flex-col items-center justify-center text-white p-4">
        <Header title="Error" />
        <div className="flex flex-col items-center gap-6 mt-10">
          <div className="text-5xl font-mono tracking-widest text-red-500">
            Error: Invalid or missing start time.
          </div>
          <div className="text-xl font-semibold text-center text-red-400">
            Please try again later or contact support.
          </div>
        </div>
      </main>
    );
  }

  // Format the time left (in ms) to a readable format (hh:mm:ss)
  const formatTime = (time: number) => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Hold Tight!" />

      <div className="flex flex-col items-center gap-6 mt-10">
        <div className="text-5xl font-mono tracking-widest">
          {/* Show countdown or 'Time's up' if countdown hits zero */}
          {timeLeft === null ? 'Loading...' : timeLeft <= 0 ? 'Game starting now!' : formatTime(timeLeft)}
        </div>
        <div className="text-xl font-semibold text-center">
          {timeLeft <= 0 ? 'Get ready for the game!' : 'Waiting for the games to begin'}
        </div>
      </div>
    </main>
  );
};

export default WaitingRoom;
