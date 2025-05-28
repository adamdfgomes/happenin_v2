import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import { postMessage } from '../utils/api'
import Header from '../components/Header'
import Background from '../components/Background'

const InterGameMessage: React.FC = () => {
  const { sessionId, teamId } = useGameSession()
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)

  const suggestions = [
    'Introduce yourself?',
    "Make them laugh then you boring cunt",
    'Share a fun fact about your team',
    'Challenge them to the next game',
    'Ask them a question',
  ]

  // 1) Start 30s countdown once, on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 2) When it hits zero, fire the send
  useEffect(() => {
    if (timeLeft > 0) return
    const sendAndGo = async () => {
      // fire request
      try {
        console.log('Submitting message:', { sessionId, teamId, text: message })
        await postMessage(sessionId!, teamId!, message)
      } catch (err) {
        console.error('Failed to send message:', err)
      } finally {
        // navigate on regardless
        navigate(`/messagereceive/${sessionId}`)
      }
    }
    sendAndGo()
  }, [timeLeft, sessionId, teamId, message, navigate])

  const handleSuggestionClick = (sug: string) => {
    setMessage(sug)
  }

  return (
    <Background>
      <Header title="Send a message" />

      {/* Timer */}
      <div className="absolute top-4 right-4 text-2xl font-bold">
        {timeLeft}s
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-2xl mt-8 flex flex-wrap gap-2 justify-center">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(sug)}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-full text-sm transition-colors"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Message Input */}
      <div className="w-full max-w-2xl mt-8">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 300))}
          placeholder="Type your message here..."
          className="w-full h-48 p-4 rounded-lg bg-green-800/50 border-2 border-green-600 focus:border-green-400 focus:outline-none resize-none"
        />
        <div className="text-right mt-2 text-sm">
          {message.length}/300 characters
        </div>
      </div>
    </Background>
  )
}

export default InterGameMessage
