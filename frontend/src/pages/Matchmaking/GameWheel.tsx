// src/pages/GameWheel.tsx
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../utils/supabasePublicClient'
import Header from '../../components/Header'
import Wheel from '../../components/Wheel'
import useFetchSessionID from '../../hooks/useFetchSessionID'
import Background from '../../components/Background'

// Shape of our session data
interface SessionData {
  selected_game:  string | null
  selected_game2: string | null
  selected_game3: string | null
  games_played:   number
}

const GameWheel: React.FC = () => {
  const navigate = useNavigate()
  const { sessionId, loading: loadingSessionId } = useFetchSessionID()

  // Local state for session record
  const [sessionRec, setSessionRec]               = useState<SessionData | null>(null)
  const [loadingSessionRec, setLoadingSessionRec] = useState(true)
  const [errorSessionRec, setErrorSessionRec]     = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch + subscribe
  useEffect(() => {
    if (!sessionId) {
      setLoadingSessionRec(false)
      return
    }

    const fetchSession = async () => {
      setLoadingSessionRec(true)
      setErrorSessionRec(null)
      try {
        const { data, error } = await supabase
          .from<SessionData>('sessions')
          .select('selected_game, selected_game2, selected_game3, games_played')
          .eq('session_id', sessionId)
          .single()
        if (error) throw error
        setSessionRec(data)
      } catch (err: any) {
        setErrorSessionRec(err.message)
      } finally {
        setLoadingSessionRec(false)
      }
    }

    fetchSession()

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `session_id=eq.${sessionId}` },
        ({ new: newRec }) => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            setSessionRec(newRec as SessionData)
          }, 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [sessionId])

  // Figure out which game to run next
  const activeGame = useMemo(() => {
    const gp = sessionRec?.games_played || 0
    if (gp === 1) return sessionRec?.selected_game
    if (gp === 2) return sessionRec?.selected_game2
    if (gp === 3) return sessionRec?.selected_game3
    return null
  }, [sessionRec])

  const handleSpinComplete = useCallback(() => {
    setTimeout(() => {
      if (activeGame && sessionId) {
        navigate(`/${activeGame}/${sessionId}`)
      }
    }, 2000)
  }, [navigate, activeGame, sessionId])

  // Show spinner until we have an activeGame
  if (
    loadingSessionId ||
    loadingSessionRec ||
    !sessionId ||
    !activeGame
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <Background>
      <Header title="Selecting your game" subtitle="Game time!" />
      <Wheel
        options={['trivia', 'two-truths-one-lie', 'drawing']}
        selectedOption={activeGame!}      
        onSpinComplete={handleSpinComplete}
      />
    </Background>
  )
}

export default GameWheel
