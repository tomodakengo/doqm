"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "../../components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HistoryPage({
  params,
}: {
  params: { tenant_id: string };
}) {
  const tenantId = params.tenant_id;

  // テナントID取得後の処理
  useEffect(() => {
    console.log("テナントID:", tenantId);
    // ここでテナント情報を取得する処理を追加
  }, [tenantId]);

  // サンプルの履歴データ
  const historyItems = [
    {
      id: 1,
      type: "test_suite_created",
      user: {
        name: "山田太郎",
        avatar: "/avatars/user1.png",
        initials: "YT",
      },
      timestamp: "2023-06-15 14:32",
      target: "ログイン機能テストスイート",
      description: "新しいテストスイートを作成しました",
    },
    {
      id: 2,
      type: "test_case_updated",
      user: {
        name: "鈴木花子",
        avatar: "/avatars/user2.png",
        initials: "SH",
      },
      timestamp: "2023-06-14 11:15",
      target: "ユーザー登録確認 - TC001",
      description: "テストケースの手順を更新しました",
    },
    {
      id: 3,
      type: "test_run_completed",
      user: {
        name: "佐藤一郎",
        avatar: "/avatars/user3.png",
        initials: "SI",
      },
      timestamp: "2023-06-13 16:45",
      target: "決済処理テストスイート v1.2",
      description: "テスト実行が完了しました（合格: 24, 失敗: 2）",
    },
    {
      id: 4,
      type: "comment_added",
      user: {
        name: "田中めぐみ",
        avatar: "/avatars/user4.png",
        initials: "TM",
      },
      timestamp: "2023-06-12 09:30",
      target: "セキュリティチェック - TC008",
      description: "「実行手順4を明確にすべき」というコメントを追加しました",
    },
    {
      id: 5,
      type: "test_suite_version",
      user: {
        name: "山田太郎",
        avatar: "/avatars/user1.png",
        initials: "YT",
      },
      timestamp: "2023-06-11 15:22",
      target: "API統合テストスイート",
      description: "バージョン2.0を作成しました",
    },
  ];

  // 履歴タイプに応じたバッジのスタイルを返す関数
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "test_suite_created":
        return "bg-green-100 text-green-800";
      case "test_case_updated":
        return "bg-blue-100 text-blue-800";
      case "test_run_completed":
        return "bg-purple-100 text-purple-800";
      case "comment_added":
        return "bg-yellow-100 text-yellow-800";
      case "test_suite_version":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 履歴タイプに応じた表示名を返す関数
  const getTypeName = (type: string) => {
    switch (type) {
      case "test_suite_created":
        return "作成";
      case "test_case_updated":
        return "更新";
      case "test_run_completed":
        return "実行完了";
      case "comment_added":
        return "コメント";
      case "test_suite_version":
        return "バージョン作成";
      default:
        return type;
    }
  };

  return (
    <MainLayout tenantId={tenantId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">変更履歴</h1>
          <p className="text-gray-600 mt-1">
            テナント「{tenantId}」の全ての操作履歴
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="test_suites">テストスイート</TabsTrigger>
            <TabsTrigger value="test_cases">テストケース</TabsTrigger>
            <TabsTrigger value="test_runs">テスト実行</TabsTrigger>
            <TabsTrigger value="comments">コメント</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>最近の操作履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={item.user.avatar}
                          alt={item.user.name}
                        />
                        <AvatarFallback>{item.user.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {item.user.name}
                            </span>
                            <Badge
                              className={`${getBadgeStyle(item.type)} font-normal`}
                            >
                              {getTypeName(item.type)}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {item.description}
                        </p>
                        <p className="text-sm font-medium text-indigo-600">
                          {item.target}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 他のタブコンテンツも同様に実装 */}
          <TabsContent value="test_suites">
            <Card>
              <CardHeader>
                <CardTitle>テストスイート関連の履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {historyItems
                    .filter((item) =>
                      ["test_suite_created", "test_suite_version"].includes(
                        item.type
                      )
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0"
                      >
                        <Avatar>
                          <AvatarImage
                            src={item.user.avatar}
                            alt={item.user.name}
                          />
                          <AvatarFallback>{item.user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {item.user.name}
                              </span>
                              <Badge
                                className={`${getBadgeStyle(item.type)} font-normal`}
                              >
                                {getTypeName(item.type)}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {item.description}
                          </p>
                          <p className="text-sm font-medium text-indigo-600">
                            {item.target}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
