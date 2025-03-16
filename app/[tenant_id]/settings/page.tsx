"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MainLayout from "../../components/layout/MainLayout";

export default function SettingsPage({
  params,
}: {
  params: { tenant_id: string };
}) {
  const [activeTab, setActiveTab] = useState("account");
  const tenantId = params.tenant_id;

  // テナントID取得後の処理
  useEffect(() => {
    console.log("テナントID:", tenantId);
    // ここでテナント情報を取得する処理を追加
  }, [tenantId]);

  return (
    <MainLayout tenantId={tenantId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 mt-1">
            アカウントおよびテナント設定の管理
          </p>
        </div>

        <Tabs
          defaultValue="account"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="account">アカウント</TabsTrigger>
            <TabsTrigger value="tenant">テナント</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>プロフィール情報</CardTitle>
                  <CardDescription>
                    個人アカウント情報を管理します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">名前</Label>
                      <Input id="name" placeholder="山田 太郎" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <Button>保存</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>パスワード変更</CardTitle>
                  <CardDescription>
                    セキュリティを保つために定期的にパスワードを変更してください
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">現在のパスワード</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">新しいパスワード</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">パスワード確認</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button>パスワード変更</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenant">
            <Card>
              <CardHeader>
                <CardTitle>テナント設定</CardTitle>
                <CardDescription>
                  テナント「{tenantId}」の基本設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name">テナント名</Label>
                    <Input id="tenant-name" placeholder="My Organization" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-domain">
                      カスタムドメイン（オプション）
                    </Label>
                    <Input id="tenant-domain" placeholder="example.com" />
                  </div>
                </div>
                <Button>保存</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>通知の受け取り方を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">メール通知</p>
                      <p className="text-sm text-gray-500">
                        テスト実行結果をメールで受け取る
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">アプリ内通知</p>
                      <p className="text-sm text-gray-500">
                        新しいコメントやメンション通知
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">定期レポート</p>
                      <p className="text-sm text-gray-500">
                        週次のテスト実行サマリーレポート
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API設定</CardTitle>
                <CardDescription>APIキーの管理と権限設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">APIキー</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="api-key"
                        value="sk_test_12345678901234567890"
                        readOnly
                      />
                      <Button variant="outline">再生成</Button>
                      <Button variant="outline">コピー</Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      APIキーは機密情報です。安全に管理してください。
                    </p>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="font-medium">APIアクセス制限</p>
                    <div className="flex items-center space-x-2">
                      <Switch id="api-enabled" defaultChecked />
                      <Label htmlFor="api-enabled">
                        APIアクセスを有効にする
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
