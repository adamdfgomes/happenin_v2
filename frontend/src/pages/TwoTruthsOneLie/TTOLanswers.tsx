import React from 'react'
import Header from '../../components/Header'
import Background from '../../components/Background'
import SelectionButton from '../../components/TwoTruthsOneLie/SelectionButton'
import Button from '../../components/Button'
import { useTTOLAnswers } from '../../hooks/useTTOLAnswers'

const TTOLanswers: React.FC = () => {
  const {
    statements,
    selectedIndex,
    handleSelect,
    handleSubmit,
  } = useTTOLAnswers()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Select the lie 🤫" />
      <div className="w-full max-w-2xl space-y-4 mt-8">
        {statements.map((stmt, idx) => (
          <SelectionButton
            key={idx}
            label={stmt.text}
            selected={selectedIndex === idx}
            onClick={() => handleSelect(idx)}
          />
        ))}
        {selectedIndex !== null && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleSubmit} className="text-xl px-8 py-3">
              Submit Selection
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

export default TTOLanswers
