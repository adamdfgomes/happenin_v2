import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../../context/GameSessionContext'
import { postMessage } from '../../utils/api'
import Header from '../../components/Header'
import Background from '../../components/Background'

const IntroMessage: React.FC = () => {
  const { sessionId, teamId } = useGameSession()
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // 1) Start 30s countdown once, on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 2) When it hits zero, fire the send — **await** the inserted row
  useEffect(() => {
    if (timeLeft > 0) return
    const sendAndGo = async () => {
      setIsSending(true)
      try {
        const row = await postMessage(sessionId!, teamId!, message)
        // Wait at least 500ms to show the animation
        await new Promise(res => setTimeout(res, 500))
        navigate(
          `/messagereceive/${sessionId}`,
          { state: { since: row.created_at } }
        )
      } catch (err) {
        console.error('Failed to send message:', err)
        setIsSending(false)
        navigate(`/messagereceive/${sessionId}`)
      }
    }
    sendAndGo()
  }, [timeLeft, sessionId, teamId, message, navigate])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, 300))
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  const progressPercentage = ((30 - timeLeft) / 30) * 100
  const isTimeRunningOut = timeLeft <= 10

  return (
    <Background>
      <Header title="Meet Your Opponents 🤝 " />

      {/* Centralized Timer and Progress Bar at Top - Mobile Optimized */}
      <div className="w-full max-w-2xl mx-auto mt-2 mb-4">
        <div className="text-center space-y-2">
          {/* Timer Display */}
          <div className="text-3xl font-bold text-gray-900 drop-shadow-lg">
            {timeLeft}s
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                isTimeRunningOut ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="text-xs text-gray-800 font-semibold">
            {isTimeRunningOut ? 'Time is running out!' : 'Time remaining'}
          </div>
        </div>
      </div>

      {/* Main Content Container - Mobile Optimized */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 space-y-4">
        
        {/* Introduction Section */}
        <div className="w-full text-center mb-4">
          <p className="text-sm text-gray-700 max-w-md mx-auto">
            Send a message to introduce your team before the game begins
          </p>
        </div>

        {/* Message Input Section - Mobile Optimized */}
        <div className="w-full max-w-2xl">
          <div className="relative">
            <textarea
              value={message}
              onChange={handleTextareaChange}
              placeholder="Tell them about your team, wish them luck, or practice your trash talk..."
              className={`w-full h-48 p-4 rounded-xl bg-blue-800/40 border-2 transition-all duration-300 resize-none text-gray-900 placeholder-gray-600 focus:outline-none text-sm font-medium ${
                isTyping 
                  ? 'border-blue-400 shadow-lg shadow-blue-500/20' 
                  : 'border-blue-600 hover:border-blue-500'
              }`}
            />
            
            {/* Character Counter with Visual Indicator - Mobile Optimized */}
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex items-center space-x-2">
                {isTyping && (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-800 font-semibold">
                  {message.length}/300
                </div>
                <div className="w-12 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      message.length > 250 ? 'bg-red-500' : 
                      message.length > 200 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(message.length / 300) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Warning - Mobile Optimized */}
        {isTimeRunningOut && (
          <div className="animate-pulse text-red-600 text-center font-bold text-sm drop-shadow-sm">
            ⏰ Time is running out! Your introduction will be sent automatically.
          </div>
        )}
      </div>
    </Background>
  )
}

export default IntroMessage

