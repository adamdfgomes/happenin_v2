import React, { useState, useEffect } from 'react'
import { useGameSession } from '../context/GameSessionContext'

interface WheelProps {
  options: string[]
  onSpinComplete?: () => void
}

const Wheel: React.FC<WheelProps> = ({ options, onSpinComplete }) => {
  const { selectedGame } = useGameSession()
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [spinComplete, setSpinComplete] = useState(false)

  useEffect(() => {
    if (!selectedGame) return

    setSpinComplete(false)
    const targetIdx = options.indexOf(selectedGame)
    const cycles = 3
    const totalSteps = cycles * options.length + targetIdx
    let currentStep = 0
    let interval = 100
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const scheduleStep = () => {
      const idx = currentStep % options.length
      setHighlightIndex(idx)
      currentStep++

      if (currentStep <= totalSteps) {
        interval += 20
        timeouts.push(setTimeout(scheduleStep, interval))
      } else {
        setSpinComplete(true)
        onSpinComplete?.()
      }
    }

    scheduleStep()

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [selectedGame, options, onSpinComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4">
        {options.map((opt, i) => {
          const isHighlighted = i === highlightIndex
          const isSelected = opt === selectedGame && spinComplete
          return (
            <div
              key={opt}
              className={
                `px-4 py-2 rounded-lg border transition-all` +
                (isHighlighted ? ' bg-blue-200 scale-110' : '') +
                (isSelected ? ' animate-pulse bg-green-200 text-green-800 font-bold' : '')
              }
            >
              {opt}
            </div>
          )
        })}
      </div>
      {!spinComplete && selectedGame && (
        <div className="mt-4 text-white italic">Choosing...</div>
      )}
    </div>
  )
}

export default Wheel
