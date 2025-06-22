// src/hooks/useChatRoom.js
import { useState, useRef, useEffect } from 'react'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'
import { postlivechat } from '../utils/api'

/**
 * Manages fetching, subscribing to, and sending live chat messages.
 * Reads from the `chatroom` table via Supabase real‐time and writes
 * via your REST API (POST /api/chatroom).
 */
export default function useChatRoom() {
  const { sessionId, teamId } = useGameSession()
  const [messages, setMessages]     = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef              = useRef(null)

  // 1️⃣ Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 2️⃣ Load existing chat + subscribe to new ones
  useEffect(() => {
    if (!sessionId) return
    let channel

    // load history
    async function loadChat() {
      const { data, error } = await supabase
        .from('chatroom')
        .select('id, text, team_id, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      if (!error && data) {
        setMessages(
          data.map(row => ({
            id:        row.id,
            text:      row.text,
            isMine:    row.team_id === teamId,
            timestamp: new Date(row.created_at).toLocaleTimeString([], {
              hour:   '2-digit',
              minute: '2-digit',
            }),
          }))
        )
      }
    }
    loadChat()

    // subscribe to live inserts
    channel = supabase
      .channel(`chatroom_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'chatroom',
          filter: `session_id=eq.${sessionId}`,
        },
        ({ new: row }) => {
          setMessages(prev => [
            ...prev,
            {
              id:        row.id,
              text:      row.text,
              isMine:    row.team_id === teamId,
              timestamp: new Date(row.created_at).toLocaleTimeString([], {
                hour:   '2-digit',
                minute: '2-digit',
              }),
            },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, teamId])

  // 3️⃣ Send a new chat message via your Express API
  const handleSend = async e => {
    e.preventDefault()
    const text = newMessage.trim()
    if (!text || !sessionId || !teamId) return
    setNewMessage('')
    try {
      await postlivechat(sessionId, teamId, text)
    } catch (err) {
      console.error('Failed to send chat message:', err)
    }
  }

  return {
    messages,
    newMessage,
    setNewMessage,
    handleSend,
    messagesEndRef,
  }
}
