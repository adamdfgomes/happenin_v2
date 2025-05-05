// src/components/Wheel.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useGameSession } from '../context/GameSessionContext'

interface WheelProps {
  options: string[]
  onSpinComplete?: () => void
}

const Wheel: React.FC<WheelProps> = ({ options, onSpinComplete }) => {
  const { selectedGame } = useGameSession()
  const [rotation, setRotation] = useState(0)
  const segmentAngle = 360 / options.length
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedGame) return

    // Compute how far to spin
    const idx = options.indexOf(selectedGame)
    const fullSpins = 5
    const finalAngle =
      fullSpins * 360 + (360 - idx * segmentAngle - segmentAngle / 2)

    setRotation(finalAngle)

    const el = wheelRef.current
    let cleanedUp = false

    const handleTransitionEnd = () => {
      if (cleanedUp) return
      cleanedUp = true
      onSpinComplete?.()
    }

    // Listen for the CSS transition to end
    el?.addEventListener('transitionend', handleTransitionEnd)

    // Fallback: in case transitionend doesn't fire
    const timeout = setTimeout(handleTransitionEnd, 5200)

    return () => {
      cleanedUp = true
      el?.removeEventListener('transitionend', handleTransitionEnd)
      clearTimeout(timeout)
    }
  }, [selectedGame, options, segmentAngle, onSpinComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          ref={wheelRef}
          className="w-64 h-64 rounded-full border-4 border-gray-300 transition-transform duration-[5000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {options.map((opt, i) => {
            const angle = i * segmentAngle
            return (
              <div
                key={opt}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${angle}deg) translate(0, -120px) rotate(-${angle}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <span className="block w-24 text-center text-sm">{opt}</span>
              </div>
            )
          })}
        </div>
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
          <div className="triangle-up" />
        </div>
      </div>
    </div>
  )
}

export default Wheel
