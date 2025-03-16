"use client";

import { useEffect, useState } from "react";
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
import { MoreHorizontal, Plus, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainLayout from "../../components/layout/MainLayout";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TeamPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const [searchQuery, setSearchQuery] = useState("");

  // テナントID取得後の処理
  useEffect(() => {
    console.log("テナントID:", tenantId);
    // ここでテナント情報を取得する処理を追加
  }, [tenantId]);

  // チームデータのサンプル
  const teams = [
    {
      id: "team-1",
      name: "開発チーム",
      description: "アプリケーション開発担当のチーム",
      memberCount: 8,
      testSuiteCount: 12,
      leadMember: {
        name: "山田太郎",
        avatarUrl: "/avatars/user1.png",
        initials: "YT",
      },
    },
    {
      id: "team-2",
      name: "QAチーム",
      description: "品質保証と検証を担当するチーム",
      memberCount: 5,
      testSuiteCount: 24,
      leadMember: {
        name: "佐藤花子",
        avatarUrl: "/avatars/user2.png",
        initials: "SH",
      },
    },
    {
      id: "team-3",
      name: "インフラチーム",
      description: "サーバーとインフラ管理を担当するチーム",
      memberCount: 4,
      testSuiteCount: 6,
      leadMember: {
        name: "鈴木一郎",
        avatarUrl: "/avatars/user3.png",
        initials: "SI",
      },
    },
    {
      id: "team-4",
      name: "デザインチーム",
      description: "UIとUXデザインを担当するチーム",
      memberCount: 3,
      testSuiteCount: 4,
      leadMember: {
        name: "高橋めぐみ",
        avatarUrl: "/avatars/user4.png",
        initials: "TM",
      },
    },
    {
      id: "team-5",
      name: "マーケティングチーム",
      description: "製品マーケティングとユーザーインサイトの収集を担当",
      memberCount: 4,
      testSuiteCount: 2,
      leadMember: {
        name: "伊藤健太",
        avatarUrl: "/avatars/user5.png",
        initials: "IK",
      },
    },
  ];

  // 検索クエリに基づいてチームをフィルタリング
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout tenantId={tenantId}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
            <p className="text-gray-600 mt-1">
              テナント「{tenantId}」のチーム一覧とメンバー管理
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>チーム作成</span>
          </Button>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="チームを検索..."
            className="pl-10 w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* チーム一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link
                          href={`/${tenantId}/team/${team.id}`}
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
                <CardDescription>{team.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={team.leadMember.avatarUrl}
                        alt={team.leadMember.name}
                      />
                      <AvatarFallback>
                        {team.leadMember.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {team.leadMember.name}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <UserPlus size={14} />
                    <span>招待</span>
                  </Button>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="rounded-sm">
                      {team.memberCount}
                    </Badge>
                    <span>メンバー</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="rounded-sm">
                      {team.testSuiteCount}
                    </Badge>
                    <span>テストスイート</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
