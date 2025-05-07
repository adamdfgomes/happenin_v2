import { useState, useEffect } from 'react'
import { getTeamByPubAndTable } from '../utils/api'

export default function useGetID(pubName, tableNumber) {
  const [teamId, setTeamId]   = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string|null>(null)

  useEffect(() => {
    if (!pubName || !tableNumber) {
      setLoading(false)
      return
    }

    getTeamByPubAndTable(pubName, tableNumber)
      .then(data => {
        setTeamId(data.team_id)
      })
      .catch(err => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [pubName, tableNumber])

  return { teamId, loading, error }
}
