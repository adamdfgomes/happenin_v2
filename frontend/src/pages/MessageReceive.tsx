// src/pages/MessageReceive.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Header from '../components/Header'
import Background from '../components/Background'
import Button from '../components/Button'

type MsgRow = { text: string; team_id: string; created_at: string }

const MessageReceive: React.FC = () => {
  const { sessionId, teamId } = useGameSession()
  const { me, them } = useFetchSelectedGame()
  const navigate = useNavigate()

  const [minDelayPassed, setMinDelayPassed] = useState(false)
  const [gotOther, setGotOther] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [showContent, setShowContent] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)

  // Determine other team's name from hook
  const otherTeamName = them.name || 'Opponent'

  // 1) enforce a 2s minimum “waiting” screen
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // 2) load the latest message from the other team, and subscribe for new ones
  useEffect(() => {
    if (!sessionId || !teamId) return

    const loadOther = async () => {
      const { data, error } = await supabase
        .from<MsgRow>('messages')
        .select('text,team_id')
        .eq('session_id', sessionId)
        .neq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setMessageText(data.text)
        setGotOther(true)
      }
    }

    loadOther()

    const channel = supabase
      .channel(`messages_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId},team_id=neq.${teamId}`,
        },
        () => {
          loadOther()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, teamId])

  // 3) once *both* the 2 s have passed and we’ve got the message,
  //    fire content & reaction animations
  useEffect(() => {
    if (minDelayPassed && gotOther) {
      const t1 = setTimeout(() => setShowContent(true), 300)
      const t2 = setTimeout(() => setShowReactions(true), 600)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [minDelayPassed, gotOther])

  // Reaction handlers
  const handleReactionClick = (emoji: string) => {
    setSelectedReaction(emoji)
    setTimeout(() => navigate(`/factfile/${sessionId}`), 1000)
  }
  const handleContinue = () => navigate(`/factfile/${sessionId}`)

  // STILL waiting?
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

  // Now render the bubble + emojis
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
        {/* Bubble + name */}
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

        {/* Reactions */}
        <div
          className={`flex gap-4 mb-8 transition-all duration-500 ${
            showReactions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
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

        {/* Fallback continue if no emoji */}
        {!selectedReaction && showReactions && (
          <Button onClick={handleContinue}>Let's play the next game</Button>
        )}
      </div>
    </Background>
  )
}

export default MessageReceive
