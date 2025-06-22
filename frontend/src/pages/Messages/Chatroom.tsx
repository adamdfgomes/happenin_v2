// src/pages/ChatRoom.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Background from '../../components/Background'
import Message from '../../components/Message'
import useChatRoom from '../../hooks/useChatRoom'
import { useGameSession } from '../../context/GameSessionContext'

const ChatRoom: React.FC = () => {
  const { sessionId } = useGameSession()
  const navigate = useNavigate()
  const {
    messages,
    newMessage,
    setNewMessage,
    handleSend,
    messagesEndRef,
  } = useChatRoom()

  // 30s countdown
  const [timeLeft, setTimeLeft] = useState(30)
  useEffect(() => {
    if (timeLeft <= 0) {
      navigate(`/Wheel/${sessionId}`)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, navigate, sessionId])

  return (
    <Background>
      {/* Timer badge */}
      <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-50 text-white rounded px-2 py-1 font-mono">
        {timeLeft}s
      </div>

      <Header title="Team Chat" />

      <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.map(msg => (
            <Message
              key={msg.id}
              text={msg.text}
              isMine={msg.isMine}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-green-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full bg-green-900/50 border-2 border-green-600 focus:border-green-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </Background>
  )
}

export default ChatRoom
