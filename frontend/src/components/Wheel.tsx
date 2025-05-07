import React, { useState, useEffect } from 'react'
import { useGameSession } from '../context/GameSessionContext'

interface WheelProps {
  options: string[]
  onSpinComplete?: () => void
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t)
}

const Wheel: React.FC<WheelProps> = ({ options, onSpinComplete }) => {
  const { selectedGame } = useGameSession()
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [spinComplete, setSpinComplete]     = useState(false)

  useEffect(() => {
    if (!selectedGame) return

    setSpinComplete(false)
    const targetIdx   = options.indexOf(selectedGame)
    const cycles      = 3
    const totalSteps  = cycles * options.length + targetIdx

    const minInterval = 5    // even faster at the start
    const maxInterval = 600  // slow crawl at the end

    let currentStep = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const scheduleStep = () => {
      setHighlightIndex(currentStep % options.length)
      currentStep++

      if (currentStep <= totalSteps) {
        const t     = currentStep / totalSteps
        const eased = easeOutQuad(t)
        const delay = minInterval + (maxInterval - minInterval) * eased

        timeouts.push(setTimeout(scheduleStep, delay))
      } else {
        setSpinComplete(true)
        onSpinComplete?.()
      }
    }

    scheduleStep()
    return () => timeouts.forEach(clearTimeout)
  }, [selectedGame, options, onSpinComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4">
        {options.map((opt, i) => {
          const isHighlighted = i === highlightIndex
          const isSelected    = opt === selectedGame && spinComplete
          return (
            <div
              key={opt}
              className={
                `px-4 py-2 rounded-lg border transition-all` +
                (isHighlighted
                  ? ' bg-blue-200 scale-110'
                  : ''
                ) +
                (isSelected
                  ? ' animate-pulse bg-green-200 text-green-800 font-bold'
                  : ''
                )
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
