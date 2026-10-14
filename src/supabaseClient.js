// Bridge / Re-export to Firebase Client
export * from './firebaseClient'
import { isFirebaseConfigured, getFirebaseConfig, saveFirebaseConfig } from './firebaseClient'

// Backward compatibility aliases
export const isSupabaseConfigured = isFirebaseConfigured
export const getSupabaseConfig = getFirebaseConfig
export const saveSupabaseConfig = saveFirebaseConfig
export const getSupabaseClient = () => null
