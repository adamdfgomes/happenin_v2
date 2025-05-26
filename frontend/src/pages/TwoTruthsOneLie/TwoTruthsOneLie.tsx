import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import EditableButton from "../../components/TwoTruthsOneLie/EditableButton"
import Header from "../../components/Header"
import Background from "../../components/Background"
import { useGameSession } from "../../context/GameSessionContext"
import { postTTOLAnswers } from "../../utils/api"

const TwoTruthsOneLie: React.FC = () => {
  const { sessionId, teamId, player1Id } = useGameSession()
  const navigate = useNavigate()

  const initialLabels = ["Enter a truth","Enter a lie","Enter a truth"]
  const [labels, setLabels] = useState<string[]>([...initialLabels])

  const handleLabelChange = (i: number, v: string) => {
    setLabels(prev => {
      const next = [...prev]
      next[i] = v.trim() || initialLabels[i]
      return next
    })
  }

  const allEdited = labels.every(
    (lab, i) => lab !== initialLabels[i] && lab.trim().length > 0
  )

  const handleSubmit = async () => {
    if (!sessionId) return console.error("No session ID")
    // determine if this user is player1 or player2
    const amIPlayer1 = teamId === player1Id

    // build only the fields for my slot
    const answers: Record<string,string> = amIPlayer1
      ? {
          p1_truth1: labels[0],
          p1_lie:    labels[1],
          p1_truth2: labels[2],
        }
      : {
          p2_truth1: labels[0],
          p2_lie:    labels[1],
          p2_truth2: labels[2],
        }

    try {
      await postTTOLAnswers(sessionId, answers)
      navigate(
       `/two-truths-one-lie/${sessionId}/waiting`,
       { state: { justSubmitted: true } }
      )
    } catch (err) {
      console.error("Failed saving your answers:", err)
    }
  }

return (
    <Background>
      <Header
        title="Two Truths One Lie"
        subtitle="No one's believing it's more than 4 inches mate"
      />
      {labels.map((lab, idx) => (
        <EditableButton
          key={idx}
          variant={idx === 1 ? "lie" : "truth"}
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
  );
}

export default TwoTruthsOneLie
