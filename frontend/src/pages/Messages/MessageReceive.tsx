import React from 'react'
import Header from '../../components/Header'
import Background from '../../components/Background'
import Button from '../../components/Button'
import useMessageReceive from '../../hooks/useMessageReceive'

const MessageReceive: React.FC = () => {
  const {
    minDelayPassed,
    gotOther,
    messageText,
    showContent,
    showReactions,
    selectedReaction,
    handleReactionClick,
    handleContinue,
  } = useMessageReceive()

  const otherTeamName = 'Opponent' // or pull from context/fetch if you like

  if (!minDelayPassed || !gotOther) {
    return (
      <Background>
        <Header title="Waiting for other team…" />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-12 h-12 border-4 border-gray-300 border-l-gray-600 rounded-full animate-spin"
            aria-label="Loading spinner"
          />
        </div>
      </Background>
    )
  }

  const reactions = [
    '😍',
    '😂',
    '🤔',
    '👏',
    '🔥',
  ]

  return (
    <Background>
      <Header title="Message from the other team" />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
        <div
          className={`relative w-full mb-8 transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-xl font-bold mb-2 text-center">
            {otherTeamName}
          </div>
          <div className="bg-green-800 rounded-2xl p-6 relative">
            <p className="text-lg text-white">{messageText}</p>
            <div
              className="absolute -bottom-4 left-8 w-0 h-0 
                         border-l-[20px] border-l-transparent
                         border-t-[20px] border-t-green-800
                         border-r-[20px] border-r-transparent"
            />
          </div>
        </div>

        <div
          className={`flex gap-4 mb-8 transition-all duration-500 ${
            showReactions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className={`text-3xl transform transition-all duration-300 hover:scale-125 ${
                selectedReaction === emoji ? 'scale-150' : ''
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {!selectedReaction && showReactions && (
          <Button onClick={handleContinue}>Let's play the first game</Button>
        )}
      </div>
    </Background>
  )
}

export default MessageReceive
