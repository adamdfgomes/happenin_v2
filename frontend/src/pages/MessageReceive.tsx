// src/pages/MessageReceive.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'
import Header from '../components/Header'
import Background from '../components/Background'
import Button from '../components/Button'

const MessageReceive: React.FC = () => {
  const {
    sessionId,
    teamId,
    player1Id,
    player2Id,
    player1TeamName,
    player2TeamName
  } = useGameSession()
  const navigate = useNavigate()

  // UI flags
  const [gotMessage, setGotMessage] = useState(false)
  const [messageText, setMessageText] = useState<string>('')
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)

  // Determine opponent’s name
  const otherTeamName =
    teamId === player1Id ? (player2TeamName || 'Opponent') : (player1TeamName || 'Opponent')

  // 1) enforce 2s minimum
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // 2) fetch latest message + subscribe
  useEffect(() => {
    if (!sessionId || !teamId) return
    let channel: any

    const loadLatest = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('text')
        .eq('session_id', sessionId)
        .neq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setMessageText(data.text)
        setGotMessage(true)
        // then show reactions after a brief pause
        setTimeout(() => setShowReactions(true), 500)
      }
    }

    loadLatest()

    channel = supabase
      .channel(`messages_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId},team_id=neq.${teamId}`,
        },
        ({ new: msg }) => {
          setMessageText(msg.text)
          setGotMessage(true)
          setTimeout(() => setShowReactions(true), 500)
        }
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [sessionId, teamId])

  // 3) handle reaction
  const handleReactionClick = (emoji: string) => {
    setSelectedReaction(emoji)
    setTimeout(() => navigate(`/factfile/${sessionId}`), 1000)
  }

  // 4) fallback continue
  const handleContinue = () => {
    navigate(`/factfile/${sessionId}`)
  }

  // While we haven’t both passed 2 s *and* received the message, show a spinner
  if (!minDelayPassed || !gotMessage) {
    return (
      <Background>
        <Header title="Waiting for other team…" />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-12 h-12 border-4 border-white border-l-transparent rounded-full animate-spin"
            aria-label="Loading spinner"
          />
        </div>
      </Background>
    )
  }

  // Once we have the message and 2 s has passed, render the bubble + reactions
  const reactions = [
    { emoji: '😍', label: 'Love it' },
    { emoji: '😂', label: 'Funny' },
    { emoji: '🤔', label: 'Interesting' },
    { emoji: '👏', label: 'Well done' },
    { emoji: '🔥', label: 'Hot take' },
  ]

  return (
    <Background>
      <Header title="Message from the other team" />
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
        {/* Speech bubble */}
        <div className="relative w-full mb-8">
          <div className="text-xl font-bold mb-2 text-center">
            {otherTeamName}
          </div>
          <div className="bg-green-800 rounded-2xl p-6 relative">
            <p className="text-lg">{messageText}</p>
            <div
              className="absolute -bottom-4 left-8 w-0 h-0 
              border-l-[20px] border-l-transparent
              border-t-[20px] border-t-green-800
              border-r-[20px] border-r-transparent"
            />
          </div>
        </div>

        {/* Reactions */}
        <div className="flex gap-4 mb-8">
          {reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => handleReactionClick(r.emoji)}
              className={`text-3xl transform transition-all duration-300 hover:scale-125 ${
                selectedReaction === r.emoji ? 'scale-150' : ''
              }`}
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>

        {/* Fallback Continue */}
        {!selectedReaction && (
          <Button onClick={handleContinue}>Let's play the next game</Button>
        )}
      </div>
    </Background>
  )
}

export default MessageReceive
