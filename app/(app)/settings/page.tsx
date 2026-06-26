import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
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

export const metadata: Metadata = { title: "Settings" }

const notifications = [
  {
    id: "alerts",
    label: "訊號警示",
    description: "當追蹤項目觸發警示時通知你。",
    defaultChecked: true,
  },
  {
    id: "digest",
    label: "每週摘要",
    description: "每週一彙整你關注市場的摘要。",
    defaultChecked: true,
  },
  {
    id: "product",
    label: "產品更新",
    description: "不定期推送 MarketTomo 新功能消息。",
    defaultChecked: false,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="設定"
        description="管理你的工作區、個人檔案與通知偏好。"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">個人檔案</TabsTrigger>
          <TabsTrigger value="workspace">工作區</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>

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
                <Label htmlFor="name">全名</Label>
                <Input id="name" defaultValue="Market Tomo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input id="email" type="email" defaultValue="you@example.com" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role">職稱</Label>
                <Input id="role" defaultValue="市場研究主管" />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>儲存變更</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
                <Label htmlFor="workspace">工作區名稱</Label>
                <Input id="workspace" defaultValue="MarketTomo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">預設地區</Label>
                <Input id="region" defaultValue="全球" />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>儲存變更</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知</CardTitle>
              <CardDescription>
                選擇 MarketTomo 要通知你的內容。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {notifications.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-1" />}
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
