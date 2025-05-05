// backend/supabaseListener.js
import { anonClient } from './supabaseClients.js'

/**
 * Call callback on every INSERT, UPDATE, or DELETE on `table`.
 * Returns an unsubscribe function.
 */
export function subscribeToTable(table, callback) {
  const subscription = anonClient
    .from(table)
    .on('INSERT', payload => callback(payload))
    .on('UPDATE', payload => callback(payload))
    .on('DELETE', payload => callback(payload))
    .subscribe()

  return () => {
    anonClient.removeSubscription(subscription)
  }
}
