"use client"

import * as React from "react"
import { toast } from "sonner"

import { useSettings } from "@/components/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Partial<Record<string, string>>

export function SettingsForm() {
  const { settings, updateSettings } = useSettings()

  const [profile, setProfile] = React.useState(settings.profile)
  const [workspace, setWorkspace] = React.useState(settings.workspace)
  const [notifications, setNotifications] = React.useState(settings.notifications)
  const [profileErrors, setProfileErrors] = React.useState<FieldErrors>({})
  const [workspaceErrors, setWorkspaceErrors] = React.useState<FieldErrors>({})

  // Hydrate local form state once from context (after localStorage loads).
  // A ref prevents re-running on subsequent context updates so unsaved edits
  // in other tabs are never overwritten.
  const initialized = React.useRef(false)
  React.useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    React.startTransition(() => {
      setProfile(settings.profile)
      setWorkspace(settings.workspace)
      setNotifications(settings.notifications)
    })
  }, [settings])

  function validateProfile(): FieldErrors {
    const errors: FieldErrors = {}
    if (!profile.name.trim()) errors.name = "請輸入全名。"
    if (!profile.email.trim()) {
      errors.email = "請輸入電子郵件。"
    } else if (!EMAIL_RE.test(profile.email.trim())) {
      errors.email = "請輸入有效的電子郵件格式。"
    }
    return errors
  }

  function validateWorkspace(): FieldErrors {
    const errors: FieldErrors = {}
    if (!workspace.name.trim()) errors.name = "請輸入工作區名稱。"
    return errors
  }

  function saveProfile() {
    const errors = validateProfile()
    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) return
    updateSettings({ profile })
    toast.success("個人檔案已儲存。")
  }

  function saveWorkspace() {
    const errors = validateWorkspace()
    setWorkspaceErrors(errors)
    if (Object.keys(errors).length > 0) return
    updateSettings({ workspace })
    toast.success("工作區設定已儲存。")
  }

  function saveNotifications() {
    updateSettings({ notifications })
    toast.success("通知偏好已儲存。")
  }

  const notificationItems = [
    {
      id: "alerts" as const,
      label: "訊號警示",
      description: "當追蹤項目觸發警示時通知你。",
    },
    {
      id: "digest" as const,
      label: "每週摘要",
      description: "每週一彙整你關注市場的摘要。",
    },
    {
      id: "product" as const,
      label: "產品更新",
      description: "不定期推送 MarketTomo 新功能消息。",
    },
  ]

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">個人檔案</TabsTrigger>
        <TabsTrigger value="workspace">工作區</TabsTrigger>
        <TabsTrigger value="notifications">通知</TabsTrigger>
      </TabsList>

      {/* Profile */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>個人檔案</CardTitle>
            <CardDescription>
              這些資訊會顯示在你的 MarketTomo 工作區中。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                全名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={profile.name}
                placeholder="請輸入全名"
                aria-invalid={!!profileErrors.name}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, name: e.target.value }))
                  if (profileErrors.name)
                    setProfileErrors((err) => ({ ...err, name: undefined }))
                }}
              />
              {profileErrors.name && (
                <p className="text-xs text-destructive">{profileErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                電子郵件 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                placeholder="you@example.com"
                aria-invalid={!!profileErrors.email}
                onChange={(e) => {
                  setProfile((p) => ({ ...p, email: e.target.value }))
                  if (profileErrors.email)
                    setProfileErrors((err) => ({ ...err, email: undefined }))
                }}
              />
              {profileErrors.email && (
                <p className="text-xs text-destructive">{profileErrors.email}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">職稱</Label>
              <Input
                id="role"
                value={profile.role}
                placeholder="例：市場研究主管"
                onChange={(e) =>
                  setProfile((p) => ({ ...p, role: e.target.value }))
                }
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={saveProfile}>儲存變更</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Workspace */}
      <TabsContent value="workspace">
        <Card>
          <CardHeader>
            <CardTitle>工作區</CardTitle>
            <CardDescription>
              套用至此工作區所有成員的設定。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">
                工作區名稱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="workspace-name"
                value={workspace.name}
                placeholder="請輸入工作區名稱"
                aria-invalid={!!workspaceErrors.name}
                onChange={(e) => {
                  setWorkspace((w) => ({ ...w, name: e.target.value }))
                  if (workspaceErrors.name)
                    setWorkspaceErrors((err) => ({ ...err, name: undefined }))
                }}
              />
              {workspaceErrors.name && (
                <p className="text-xs text-destructive">{workspaceErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">預設地區</Label>
              <Input
                id="region"
                value={workspace.region}
                placeholder="例：日本"
                onChange={(e) =>
                  setWorkspace((w) => ({ ...w, region: e.target.value }))
                }
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={saveWorkspace}>儲存變更</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Notifications */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>通知</CardTitle>
            <CardDescription>
              選擇 MarketTomo 要通知你的內容。設定儲存於本機，未來版本將支援電子郵件通知。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {notificationItems.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between gap-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={notifications[item.id]}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({ ...n, [item.id]: checked }))
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={saveNotifications}>儲存變更</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
