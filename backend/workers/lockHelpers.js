// backend/workers/lockHelpers.js
import { adminClient } from './supabaseClients.js'

// Use the same 64-bit integer key that your session_setup uses
const LOCK_KEY = 42

/**
 * Try to grab a Postgres advisory lock.
 * @returns {Promise<boolean>} true if we got the lock, false otherwise
 */
export async function acquireLock() {
  const { data, error } = await adminClient
    .rpc('pg_try_advisory_lock', { key: LOCK_KEY })
  if (error) {
    console.error('acquireLock error', error)
    return false
  }
  return data === true
}

/**
 * Release the advisory lock.
 */
export async function releaseLock() {
  const { error } = await adminClient
    .rpc('pg_advisory_unlock', { key: LOCK_KEY })
  if (error) {
    console.error('releaseLock error', error)
  }
}
