// backend/workers/lockHelpers.js
import { adminClient } from './supabaseClients.js'

// Use a constant key for your single lock
const LOCK_KEY = 42

/**
 * Try to grab the lock by inserting into locks.
 * @returns {Promise<boolean>}
 */
export async function acquireLock() {
  const { error } = await adminClient
    .from('locks')
    .insert({ lock_id: LOCK_KEY }, { returning: 'minimal' })
  // if there's a conflict error, someone else holds the lock
  if (error && error.code === '23505') {
    // unique_violation
    return false
  }
  if (error) {
    console.error('acquireLock error', error)
    return false
  }
  return true
}

/**
 * Release the lock by deleting that row.
 */
export async function releaseLock() {
  const { error } = await adminClient
    .from('locks')
    .delete()
    .eq('lock_id', LOCK_KEY)
  if (error) console.error('releaseLock error', error)
}
