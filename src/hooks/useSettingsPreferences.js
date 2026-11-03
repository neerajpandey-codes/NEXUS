import { createContext, createElement, useContext, useEffect, useState } from 'react'
import { settingsDefaults } from '../data/phase7Data.js'

const storageKey = 'nexus-ui-preferences'
const SettingsPreferencesContext = createContext(null)

function readPreferences() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null')
    if (!saved) return structuredClone(settingsDefaults)
    return {
      ...settingsDefaults,
      ...saved,
      profile: { ...settingsDefaults.profile, ...saved.profile },
      notifications: { ...settingsDefaults.notifications, ...saved.notifications },
      general: { ...settingsDefaults.general, ...saved.general },
    }
  } catch {
    return structuredClone(settingsDefaults)
  }
}

export function SettingsPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // Keep the controls usable when browser storage is unavailable.
    }
  }, [preferences])

  return createElement(SettingsPreferencesContext.Provider, { value: [preferences, setPreferences] }, children)
}

export default function useSettingsPreferences() {
  const context = useContext(SettingsPreferencesContext)
  if (!context) throw new Error('useSettingsPreferences must be used inside SettingsPreferencesProvider')
  return context
}
