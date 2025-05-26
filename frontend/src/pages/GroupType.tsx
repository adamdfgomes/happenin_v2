// frontend/src/pages/GroupType.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import { useGameSession } from '../context/GameSessionContext';
import { updateTeamGroupType } from '../utils/api';
import Background from '../components/Background';

const TeamSetup: React.FC = () => {
  const { setGroupType, teamId } = useGameSession();
  const [choice, setChoice] = useState<'boys' | 'girls' | 'mixed' | ''>('');

  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice || !teamId) return;
    try {
            // write the user’s choice into your teams table
      await updateTeamGroupType(teamId, choice);
      // also keep it locally
      setGroupType(choice);
      nav('/team');
     } catch (err) {
      console.error('Failed to update group_type:', err);
      alert('Could not save your selection. Please try again.');
    }
  };

  return (
    <Background>
      <Header title="What's Your Group?" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        {[
          { key: 'girls', label: 'Girls Night',   subtitle: '💔 Who got dumped then?' },
          { key: 'boys',  label: 'Boys Night',    subtitle: '🌭 Bunch of virgins' },
          { key: 'mixed', label: 'Mixed Group',   subtitle: '🥳 Aren’t you cool?' },
        ].map(({ key, label, subtitle }) => (
          <label
            key={key}
            className={[
              'flex justify-between items-center p-4 rounded-lg cursor-pointer',
              choice === key
                ? 'border-2 border-white bg-opacity-20'
                : 'border border-transparent hover:bg-white/10',
            ].join(' ')}
          >
            <div>
              <div className="font-semibold">{label}</div>
              <div className="text-sm opacity-75">{subtitle}</div>
            </div>
            <input
              type="radio"
              name="group"
              value={key}
              className="form-radio h-5 w-5 text-white"
              checked={choice === key}
              onChange={() => setChoice(key as 'boys' | 'girls' | 'mixed')}
            />
          </label>
        ))}

        <Button type="submit" disabled={!choice}>
          Next
        </Button>
      </form>
    </Background>
  );
};

export default TeamSetup;
