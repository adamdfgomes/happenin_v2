// backend/supabaseListener.js
import { adminClient } from './supabaseClients.js'

/**
 * Call callback on every INSERT, UPDATE, or DELETE on `table`.
 * Returns an unsubscribe function.
 */
export function subscribeToTable(table, callback) {
  const subscription = adminClient
    .from(table)
    .on('INSERT', payload => callback(payload))
    .on('UPDATE', payload => callback(payload))
    .on('DELETE', payload => callback(payload))
    .subscribe()

  return () => {
    adminClient.removeSubscription(subscription)
  }
}
