import React from 'react'
import Header from '../../components/Header'
import Background from '../../components/Background'
import useIntroMessage from '../../hooks/useIntroMessage'
import Button from '../../components/Button'

const IntroMessage: React.FC = () => {
  const {
    message,
    handleChange,
    timeLeft,
    isTyping,
    progressPercentage,
    isTimeRunningOut,
  } = useIntroMessage()

  return (
    <Background>
      <Header title="Meet Your Opponents 🤝" />

      <div className="w-full max-w-2xl mx-auto mt-4 mb-6 text-center">
        <div className="text-3xl font-bold">{timeLeft}s</div>
        <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden my-2">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isTimeRunningOut
                ? 'bg-gradient-to-r from-red-500 to-red-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs font-semibold text-gray-800">
          {isTimeRunningOut ? 'Time is running out!' : 'Time remaining'}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 space-y-4">
        <p className="text-sm text-gray-700 text-center mb-4">
          Send a message to introduce your team before the game begins
        </p>

        <textarea
          value={message}
          onChange={handleChange}
          placeholder="Tell them about your team, wish them luck…"
          className={`w-full max-w-2xl h-48 p-4 rounded-xl bg-blue-800/40 border-2 transition-all duration-300 resize-none text-gray-900 placeholder-gray-600 focus:outline-none text-sm font-medium ${
            isTyping
              ? 'border-blue-400 shadow-lg shadow-blue-500/20'
              : 'border-blue-600 hover:border-blue-500'
          }`}
        />

        <div className="w-full max-w-2xl flex justify-between items-center">
          <div className="text-xs text-gray-800 font-semibold">
            {message.length}/300
          </div>
          <div className="w-12 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                message.length > 250
                  ? 'bg-red-500'
                  : message.length > 200
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${(message.length / 300) * 100}%` }}
            />
          </div>
        </div>

        {isTimeRunningOut && (
          <div className="animate-pulse text-red-600 text-sm font-bold text-center">
            ⏰ Time is running out! Your introduction will be sent automatically.
          </div>
        )}
      </div>
    </Background>
  )
}

export default IntroMessage
