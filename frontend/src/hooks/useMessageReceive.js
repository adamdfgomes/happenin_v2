import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

export default function useMessageReceive() {
  const { sessionId, teamId } = useGameSession()
  const navigate = useNavigate()

  const [minDelayPassed, setMinDelayPassed] = useState(false)
  const [gotOther, setGotOther]         = useState(false)
  const [messageText, setMessageText]   = useState('')
  const [showContent, setShowContent]   = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState(null)

  // 1️⃣ splash delay
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // 2️⃣ load + subscribe to other-team message
  useEffect(() => {
    if (!sessionId || !teamId) return

    let channel, cancelled = false

    async function loadOther() {
      const { data, error } = await supabase
        .from('messages')
        .select('text,team_id,created_at')
        .eq('session_id', sessionId)
        .neq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (!error && data && !cancelled) {
        setMessageText(data.text)
        setGotOther(true)
      }
    }
    loadOther()

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
        ({ new: rec }) => {
          setMessageText(rec.text)
          setGotOther(true)
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [sessionId, teamId])

  // 3️⃣ once both splash & message, reveal + reactions animation
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

  function handleReactionClick(emoji) {
    setSelectedReaction(emoji)
    setTimeout(() => navigate(`/Wheel/${sessionId}`), 1000)
  }

  function handleContinue() {
    navigate(`/Wheel/${sessionId}`)
  }

  return {
    minDelayPassed,
    gotOther,
    messageText,
    showContent,
    showReactions,
    selectedReaction,
    handleReactionClick,
    handleContinue,
  }
}
