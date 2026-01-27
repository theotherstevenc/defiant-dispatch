import { useState } from 'react'

import { logError } from './logError'

function usePersistentValue<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        logError('Failed to parse from localStorage:', 'usePersistentValue', error)
        return defaultValue
      }
    }
    return defaultValue
  })

  const updateValue = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, updateValue] as const
}

export default usePersistentValue
