"use client"

import * as React from "react"
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/settings"

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (next: Partial<AppSettings>) => void
}

const SettingsContext = React.createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
})

export function useSettings() {
  return React.useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS)

  React.useEffect(() => {
    React.startTransition(() => setSettings(loadSettings()))
  }, [])

  const updateSettings = React.useCallback(
    (next: Partial<AppSettings>) => {
      setSettings((prev) => {
        const merged: AppSettings = {
          profile: { ...prev.profile, ...(next.profile ?? {}) },
          workspace: { ...prev.workspace, ...(next.workspace ?? {}) },
          notifications: {
            ...prev.notifications,
            ...(next.notifications ?? {}),
          },
        }
        saveSettings(merged)
        return merged
      })
    },
    [],
  )

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
