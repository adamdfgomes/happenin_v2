// src/pages/TwoTruthsOneLie/TTOLwaitingroom.tsx
import React from 'react'
import Header from '../../components/Header'
import Background from '../../components/Background'
import { useTTOLWaiting } from '../../hooks/useTTOLWaiting'

const TTOLwaitingroom: React.FC = () => {
  // Hook handles subscription & navigation side effects
  useTTOLWaiting()

  return (
    <Background>
      <Header title="Waiting for your competition… hang tight!" />
    </Background>
  )
}

export default TTOLwaitingroom