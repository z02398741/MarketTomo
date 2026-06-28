import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings/settings-form"

export const metadata: Metadata = { title: "設定" }

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="設定"
        description="管理你的工作區、個人檔案與通知偏好。"
      />
      <SettingsForm />
    </div>
  )
}
