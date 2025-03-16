"use client";

import MainLayout from "../components/layout/MainLayout";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import CreateTeamModal from "../components/team/CreateTeamModal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeamPage() {
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // 仮のチームデータ
  const teams = [
    {
      id: 1,
      name: "開発チーム",
      description: "製品開発を担当するチーム",
      members: 5,
      role: "管理者",
    },
    {
      id: 2,
      name: "QAチーム",
      description: "品質保証を担当するチーム",
      members: 3,
      role: "メンバー",
    },
    {
      id: 3,
      name: "マーケティングチーム",
      description: "マーケティング活動を担当するチーム",
      members: 4,
      role: "閲覧者",
    },
  ];

  const handleCreateTeam = async (data: {
    name: string;
    description: string;
  }) => {
    try {
      // TODO: Supabaseにチームを作成する処理を実装
      console.log("Creating team:", data);
      // 成功したら閉じる
      setIsCreateTeamModalOpen(false);
      // リストを更新
      router.refresh();
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
          <Button onClick={() => setIsCreateTeamModalOpen(true)}>
            <LucideIcons.PlusCircle className="w-4 h-4 mr-2" />
            チームを作成
          </Button>
        </div>

        <div className="relative">
          <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input className="pl-10" placeholder="チーム名で検索..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <LucideIcons.Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">{team.name}</h3>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    team.role === "管理者"
                      ? "bg-blue-100 text-blue-800"
                      : team.role === "メンバー"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {team.role}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{team.description}</p>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">
                  {team.members} メンバー
                </span>
                <Button variant="outline" size="sm">
                  <LucideIcons.UserPlus className="w-4 h-4 mr-1" />
                  招待
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isCreateTeamModalOpen && (
          <CreateTeamModal
            isOpen={isCreateTeamModalOpen}
            onClose={() => setIsCreateTeamModalOpen(false)}
            onSubmit={handleCreateTeam}
          />
        )}
      </div>
    </MainLayout>
  );
}
