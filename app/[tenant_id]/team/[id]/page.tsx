"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainLayout from "../../../components/layout/MainLayout";
import Link from "next/link";

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const teamId = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  // テナントIDとチームID取得後の処理
  useEffect(() => {
    console.log("テナントID:", tenantId, "チームID:", teamId);
    // ここでチーム情報を取得する処理を追加
  }, [tenantId, teamId]);

  // チームデータのサンプル（通常はAPIから取得）
  const teamData = {
    id: teamId,
    name:
      teamId === "team-1"
        ? "開発チーム"
        : teamId === "team-2"
          ? "QAチーム"
          : "チーム",
    description: "アプリケーション開発とテストを担当するチーム",
    createdAt: "2023-01-15",
    members: [
      {
        id: "user-1",
        name: "山田太郎",
        email: "yamada@example.com",
        role: "リーダー",
        avatarUrl: "/avatars/user1.png",
        initials: "YT",
        joinedAt: "2023-01-15",
        status: "active",
      },
      {
        id: "user-2",
        name: "佐藤花子",
        email: "sato@example.com",
        role: "開発者",
        avatarUrl: "/avatars/user2.png",
        initials: "SH",
        joinedAt: "2023-01-20",
        status: "active",
      },
      {
        id: "user-3",
        name: "鈴木一郎",
        email: "suzuki@example.com",
        role: "QAエンジニア",
        avatarUrl: "/avatars/user3.png",
        initials: "SI",
        joinedAt: "2023-02-05",
        status: "active",
      },
      {
        id: "user-4",
        name: "田中めぐみ",
        email: "tanaka@example.com",
        role: "デザイナー",
        avatarUrl: "/avatars/user4.png",
        initials: "TM",
        joinedAt: "2023-03-10",
        status: "active",
      },
      {
        id: "user-5",
        name: "伊藤健太",
        email: "ito@example.com",
        role: "マネージャー",
        avatarUrl: "/avatars/user5.png",
        initials: "IK",
        joinedAt: "2023-01-15",
        status: "inactive",
      },
    ],
    testSuites: [
      {
        id: "suite-1",
        name: "ログイン機能テストスイート",
        description: "ユーザーログイン機能のテストケース集",
        totalCases: 15,
        passedCases: 12,
        lastRun: "2023-06-10",
        status: "active",
      },
      {
        id: "suite-2",
        name: "ユーザー登録機能テストスイート",
        description: "新規ユーザー登録プロセスの検証",
        totalCases: 18,
        passedCases: 16,
        lastRun: "2023-06-08",
        status: "active",
      },
      {
        id: "suite-3",
        name: "プロファイル管理テストスイート",
        description: "ユーザープロファイル編集と閲覧機能の検証",
        totalCases: 10,
        passedCases: 9,
        lastRun: "2023-06-05",
        status: "active",
      },
    ],
    activities: [
      {
        id: "activity-1",
        type: "member_added",
        user: {
          name: "山田太郎",
          avatarUrl: "/avatars/user1.png",
          initials: "YT",
        },
        description: "田中めぐみをチームに追加しました",
        timestamp: "2023-06-12 14:30",
      },
      {
        id: "activity-2",
        type: "test_suite_created",
        user: {
          name: "佐藤花子",
          avatarUrl: "/avatars/user2.png",
          initials: "SH",
        },
        description:
          "新しいテストスイート「プロファイル管理テストスイート」を作成しました",
        timestamp: "2023-06-10 11:15",
      },
      {
        id: "activity-3",
        type: "test_run_completed",
        user: {
          name: "鈴木一郎",
          avatarUrl: "/avatars/user3.png",
          initials: "SI",
        },
        description:
          "「ログイン機能テストスイート」のテスト実行が完了しました（合格: 12/15）",
        timestamp: "2023-06-08 16:45",
      },
    ],
  };

  // 検索クエリに基づいてメンバーをフィルタリング
  const filteredMembers = teamData.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 活動タイプに応じたバッジのスタイルを返す関数
  const getActivityBadgeStyle = (type: string) => {
    switch (type) {
      case "member_added":
        return "bg-green-100 text-green-800";
      case "test_suite_created":
        return "bg-blue-100 text-blue-800";
      case "test_run_completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout tenantId={tenantId}>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${tenantId}/team`)}
            className="h-8 w-8"
          >
            <ChevronLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {teamData.name}
            </h1>
            <p className="text-gray-600 mt-1">{teamData.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">作成日</span>
              <span className="font-medium">{teamData.createdAt}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">メンバー数</span>
              <span className="font-medium">{teamData.members.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">テストスイート</span>
              <span className="font-medium">{teamData.testSuites.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Pencil size={14} />
              <span>編集</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={14} />
              <span>削除</span>
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="members"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="members">メンバー</TabsTrigger>
            <TabsTrigger value="test-suites">テストスイート</TabsTrigger>
            <TabsTrigger value="activity">活動履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="メンバーを検索..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} />
                  <span>メンバー招待</span>
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>チームメンバー</CardTitle>
                  <CardDescription>
                    現在のチームメンバーと権限の管理
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status === "active"
                              ? "アクティブ"
                              : "非アクティブ"}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            {member.role}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>編集</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="test-suites">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>テストスイート</CardTitle>
                  <CardDescription>
                    チームが管理するテストスイート一覧
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-1">
                  <Plus size={14} />
                  <span>新規作成</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-4">
                  {teamData.testSuites.map((suite) => (
                    <div
                      key={suite.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{suite.name}</div>
                        <div className="text-sm text-gray-500">
                          {suite.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-green-600">
                            {suite.passedCases}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span>{suite.totalCases}</span>
                          <span className="text-gray-400 ml-1">件合格</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {suite.lastRun}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link
                                href={`/${tenantId}/test-suites/${suite.id}`}
                                className="w-full"
                              >
                                詳細を表示
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>編集</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>活動履歴</CardTitle>
                <CardDescription>
                  チームメンバーの最近の活動履歴
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teamData.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={activity.user.avatarUrl}
                          alt={activity.user.name}
                        />
                        <AvatarFallback>
                          {activity.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>
                            <Badge
                              className={getActivityBadgeStyle(activity.type)}
                            >
                              {activity.type === "member_added"
                                ? "メンバー追加"
                                : activity.type === "test_suite_created"
                                  ? "テストスイート作成"
                                  : activity.type === "test_run_completed"
                                    ? "テスト実行"
                                    : activity.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {activity.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {activity.description}
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
