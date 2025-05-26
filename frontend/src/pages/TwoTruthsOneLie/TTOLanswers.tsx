import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../utils/supabasePublicClient'
import randomizeWheel from '../../utils/randomizeWheel'
import { useGameSession } from '../../context/GameSessionContext'
import Header from '../../components/Header'
import SelectionButton from '../../components/TwoTruthsOneLie/SelectionButton'
import Button from '../../components/Button'

// Define a statement with text and whether it's the lie
interface Statement {
  text: string
  isLie: boolean
}

const TTOLanswers: React.FC = () => {
  const { sessionId, teamId, player1Id } = useGameSession()
  const navigate = useNavigate()

  const [statements, setStatements] = useState<Statement[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Load opponent's statements in random order
  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      const { data, error } = await supabase
        .from('two-truths-one-lie')
        .select('p1_truth1,p1_truth2,p1_lie,p2_truth1,p2_truth2,p2_lie')
        .eq('session_id', sessionId)
        .single()
      if (error || !data) {
        console.error('Error loading TTOL answers:', error)
        return
      }
      // Determine opponent's truths/lie
      const amIPlayer1 = teamId === player1Id
      const truths = amIPlayer1
        ? [data.p2_truth1, data.p2_truth2]
        : [data.p1_truth1, data.p1_truth2]
      const lie = amIPlayer1 ? data.p2_lie : data.p1_lie

      // Build array of Statement objects
      const opts: Statement[] = [
        { text: truths[0]!, isLie: false },
        { text: truths[1]!, isLie: false },
        { text: lie!,        isLie: true  },
      ]
      // Shuffle by repeatedly picking a random element
      const shuffled: Statement[] = []
      while (opts.length) {
        const pick = randomizeWheel(opts)
        shuffled.push(pick)
        opts.splice(opts.indexOf(pick), 1)
      }
      setStatements(shuffled)
    })()
  }, [sessionId, teamId, player1Id])

  const handleClick = (index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index))
  }

  const handleSubmit = () => {
    if (selectedIndex === null) return
    const isCorrect = statements[selectedIndex].isLie
    console.log('Selected lie index:', selectedIndex, 'wasCorrect?', isCorrect)
    navigate(
      `/two-truths-one-lie/${sessionId}/results`,
      { state: { isCorrect } }
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Select the lie 🤫" />
      <div className="w-full max-w-2xl space-y-4 mt-8">
        {statements.map((stmt, idx) => (
          <SelectionButton
            key={idx}
            label={stmt.text}
            selected={selectedIndex === idx}
            onClick={() => handleClick(idx)}
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
