import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Background from '../../components/Background';

const TTOLwaitingroom: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/ttol/1/answers');   // ← need to change this to sessionid and get it to pull from gamesessioncontext
    }, 5000);                         // 5 s - need to change to when other player has also completed answers

    return () => clearTimeout(timer); // clean-up if the component unmounts early
  }, [navigate]);

    return (
      <Background>
        <Header title="Waiting for your competition. I know... hurry up lads!!! 🤬" />
      </Background>
  );
};

export default TTOLwaitingroom;

