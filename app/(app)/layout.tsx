import { AppShell } from "@/components/app-shell"
import { TrackingProvider } from "@/components/tracking-context"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TrackingProvider>
      <AppShell>{children}</AppShell>
    </TrackingProvider>
  )
}
