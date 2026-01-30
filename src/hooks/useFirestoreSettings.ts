import { useCallback } from 'react'

import { useEditorSettingsContext, EditorConfigSettings } from '../context/EditorSettingsContext'
import { useEmailContext, EmailSettings } from '../context/EmailContext'
import { useThemeContext, ThemeSettings } from '../context/ThemeContext'
import { db } from '../firebase'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

// Union type of all settings
type AllSettings = ThemeSettings & EditorConfigSettings & EmailSettings

/**
 * Custom hook for updating Firestore settings with automatic local state synchronization.
 * Eliminates duplicated Firestore update logic across components.
 * Works with split contexts for optimal performance.
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
  const { dispatchTheme } = useThemeContext()
  const { dispatchEditorConfig } = useEditorSettingsContext()
  const { dispatchEmail } = useEmailContext()

  // Helper to determine which context(s) to update based on setting key
  const updateContexts = useCallback(
    (key: keyof AllSettings, value: AllSettings[keyof AllSettings]) => {
      // Theme settings
      if (key === 'isDarkMode' || key === 'isPreviewDarkMode' || key === 'appColorScheme') {
        dispatchTheme({ type: 'UPDATE_THEME_SETTING', key: key as keyof ThemeSettings, value: value as any })
      }
      // Editor config settings
      else if (
        key === 'isMinifyEnabled' ||
        key === 'isWordWrapEnabled' ||
        key === 'isPreventThreadingEnabled' ||
        key === 'activeEditor' ||
        key === 'hideWorkingFiles'
      ) {
        dispatchEditorConfig({
          type: 'UPDATE_EDITOR_CONFIG_SETTING',
          key: key as keyof EditorConfigSettings,
          value: value as any,
        })
      }
      // Email settings
      else if (
        key === 'subject' ||
        key === 'emailAddresses' ||
        key === 'host' ||
        key === 'port' ||
        key === 'username' ||
        key === 'pass' ||
        key === 'from'
      ) {
        dispatchEmail({ type: 'UPDATE_EMAIL_SETTING', key: key as keyof EmailSettings, value: value as any })
      }
    },
    [dispatchTheme, dispatchEditorConfig, dispatchEmail]
  )

  /**
   * Update a single setting in Firestore and local state
   */
  const updateSetting = useCallback(
    async <K extends keyof AllSettings>(key: K, value: AllSettings[K], componentName?: string): Promise<boolean> => {
      try {
        // Update Firestore first
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, { [key]: value })

        // Update appropriate local context
        updateContexts(key, value)

        return true
      } catch (error) {
        const context = componentName || 'useFirestoreSettings'
        logError(`Failed to update ${String(key)}`, context, error)
        return false
      }
    },
    [updateContexts]
  )

  /**
   * Update multiple settings in Firestore and local state atomically
   */
  const updateMultipleSettings = useCallback(
    async (settings: Partial<AllSettings>, componentName?: string): Promise<boolean> => {
      try {
        // Update Firestore first
        await updateFirestoreDoc(db, COLLECTION, DOCUMENT, settings)

        // Update appropriate local contexts for each setting
        Object.entries(settings).forEach(([key, value]) => {
          updateContexts(key as keyof AllSettings, value)
        })

        return true
      } catch (error) {
        const context = componentName || 'useFirestoreSettings'
        logError('Failed to update settings', context, error)
        return false
      }
    },
    [updateContexts]
  )

  return { updateSetting, updateMultipleSettings }
}
