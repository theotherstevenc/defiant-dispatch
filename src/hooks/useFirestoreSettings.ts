import { useCallback } from 'react'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { EditorSettings } from '../interfaces'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

/**
 * Custom hook for updating Firestore settings with automatic local state synchronization.
 * Eliminates duplicated Firestore update logic across components.
 *
 * @returns Object with updateSetting and updateMultipleSettings functions
 *
 * @example
 * const { updateSetting } = useFirestoreSettings()
 * await updateSetting('isDarkMode', true)
 *
 * @example
 * const { updateMultipleSettings } = useFirestoreSettings()
 * await updateMultipleSettings({ isMinifyEnabled: false, isWordWrapEnabled: false })
 */
export function useFirestoreSettings() {
  const { dispatch } = useAppContext()

  /**
   * Update a single setting in Firestore and local state
   */
  const updateSetting = useCallback(
    async <K extends keyof EditorSettings>(key: K, value: EditorSettings[K], componentName?: string): Promise<boolean> => {
      try {
        // Update Firestore first
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, { [key]: value })

        // Update local state after successful Firestore update
        dispatch({ type: 'UPDATE_SETTING', key, value })

        return true
      } catch (error) {
        const context = componentName || 'useFirestoreSettings'
        logError(`Failed to update ${String(key)}`, context, error)
        return false
      }
    },
    [dispatch]
  )

  /**
   * Update multiple settings in Firestore and local state atomically
   */
  const updateMultipleSettings = useCallback(
    async (settings: Partial<EditorSettings>, componentName?: string): Promise<boolean> => {
      try {
        // Update Firestore first
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, settings)

        // Update local state after successful Firestore update
        dispatch({ type: 'SET_SETTINGS', payload: settings })

        return true
      } catch (error) {
        const context = componentName || 'useFirestoreSettings'
        logError('Failed to update settings', context, error)
        return false
      }
    },
    [dispatch]
  )

  return { updateSetting, updateMultipleSettings }
}
