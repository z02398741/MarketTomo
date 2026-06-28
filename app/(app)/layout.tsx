import { AppShell } from "@/components/app-shell"
import { TrackingProvider } from "@/components/tracking-context"
import { SettingsProvider } from "@/components/settings-context"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SettingsProvider>
      <TrackingProvider>
        <AppShell>{children}</AppShell>
      </TrackingProvider>
    </SettingsProvider>
  )
}
