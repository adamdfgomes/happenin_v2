// backend/workers/lockHelpers.js
import { adminClient } from './supabaseClients.js'

// default key for your “main” lock
const DEFAULT_LOCK_KEY = 42

/**
 * Try to grab the lock by inserting into locks.
 * @param {number} lockId  The lock_id to grab
 * @returns {Promise<boolean>}
 */
export async function acquireLock(lockId = DEFAULT_LOCK_KEY) {
  const { error } = await adminClient
    .from('locks')
    .insert({ lock_id: lockId }, { returning: 'minimal' })

  // 23505 = unique_violation → someone else has it
  if (error && error.code === '23505') {
    return false
  }
  if (error) {
    console.error(`acquireLock(${lockId}) error`, error)
    return false
  }
  return true
}

/**
 * Release the lock by deleting that row.
 * @param {number} lockId  The lock_id to release
 */
export async function releaseLock(lockId = DEFAULT_LOCK_KEY) {
  const { error } = await adminClient
    .from('locks')
    .delete()
    .eq('lock_id', lockId)

  if (error) {
    console.error(`releaseLock(${lockId}) error`, error)
  }
}
