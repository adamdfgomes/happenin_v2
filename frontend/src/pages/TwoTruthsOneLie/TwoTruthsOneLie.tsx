import React from 'react'
import Background from '../../components/Background'
import Header from '../../components/Header'
import EditableButton from '../../components/TwoTruthsOneLie/EditableButton'
import { useTwoTruthsOneLie } from '../../hooks/useTwoTruthsOneLie'

const TwoTruthsOneLie: React.FC = () => {
  const { labels, handleLabelChange, allEdited, handleSubmit } =
    useTwoTruthsOneLie()

  const initialLabels = ['Enter a truth', 'Enter a lie', 'Enter a truth']

  return (
    <Background>
      <Header
        title="Two Truths One Lie"
        subtitle="No one's believing it's more than 4 inches mate"
      />
      {labels.map((lab, idx) => (
        <EditableButton
          key={idx}
          variant={idx === 1 ? 'lie' : 'truth'}
          initialLabel={initialLabels[idx]}
          onLabelChange={(val) => handleLabelChange(idx, val)}
        />
      ))}
      {allEdited && (
        <button
          className="mt-4 py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}
    </Background>
  )
}

export default TwoTruthsOneLie
