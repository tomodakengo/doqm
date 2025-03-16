"use client";

import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamMembers } from "@/lib/api/supabase";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Edit, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TeamMember = {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeamData() {
      try {
        setLoading(true);

        // チーム情報を取得
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("id", params.id)
          .single();

        if (teamError) throw teamError;
        setTeam(teamData);

        // チームメンバーを取得
        const { data: membersData, error: membersError } = await supabase
          .from("team_members")
          .select(
            `
            id,
            role,
            joined_at,
            user_id,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `
          )
          .eq("team_id", params.id);

        if (membersError) throw membersError;
        setMembers(membersData as TeamMember[]);

        // 現在のユーザーの権限を確認
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const currentMember = membersData?.find(
            (member) => member.user_id === user.id
          );
          setIsAdmin(currentMember?.role === "admin");
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        router.push("/team");
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [params.id, router, supabase]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. メールアドレスからユーザーを検索
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteEmail)
        .single();

      if (userError) {
        alert(
          "ユーザーが見つかりませんでした。正確なメールアドレスを入力してください。"
        );
        return;
      }

      // 2. チームメンバーに追加
      const { error: inviteError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: params.id,
            user_id: userData.id,
            role: inviteRole,
          },
        ]);

      if (inviteError) throw inviteError;

      // 3. 更新されたメンバーリストを取得
      const { data: membersData } = await supabase
        .from("team_members")
        .select(
          `
          id,
          role,
          joined_at,
          user_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("team_id", params.id);

      setMembers(membersData as TeamMember[]);
      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("メンバー招待中にエラーが発生しました。");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("このメンバーをチームから削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      // メンバーリストを更新
      setMembers(members.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
      alert("メンバー削除中にエラーが発生しました。");
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      // メンバーリストを更新
      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error("Error updating member role:", error);
      alert("ロール更新中にエラーが発生しました。");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
          <div className="h-60 w-full bg-gray-200 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800">
            チームが見つかりませんでした
          </h2>
          <p className="text-gray-600 mb-6">
            このチームは存在しないか、アクセス権限がありません
          </p>
          <Link href="/team">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              チーム一覧に戻る
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/team" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
            )}
          </div>
          {isAdmin && (
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              チーム削除
            </Button>
          )}
        </div>

        {/* チーム詳細 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            チーム詳細
          </h2>
          <p className="text-gray-600 mb-4">
            {team.description || "説明はありません"}
          </p>
          <div className="flex space-x-12">
            <div>
              <p className="text-sm text-gray-500">作成日</p>
              <p className="font-medium">
                {new Date(team.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">メンバー数</p>
              <p className="font-medium">{members.length}人</p>
            </div>
          </div>
        </div>

        {/* メンバー管理セクション */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              チームメンバー
            </h2>
            {isAdmin && (
              <Button onClick={() => setShowInviteForm(!showInviteForm)}>
                <UserPlus className="w-4 h-4 mr-2" />
                メンバーを招待
              </Button>
            )}
          </div>

          {/* 招待フォーム */}
          {showInviteForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form
                onSubmit={handleInviteMember}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ロール
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">管理者</option>
                    <option value="member">メンバー</option>
                    <option value="viewer">閲覧者</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="mr-2">
                    招待する
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* メンバーテーブル */}
          <div className="p-6">
            {members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ユーザー</TableHead>
                    <TableHead>ロール</TableHead>
                    <TableHead>参加日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {member.profiles.full_name?.[0] ||
                              member.profiles.username?.[0] ||
                              "U"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.profiles.full_name || "名前なし"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.profiles.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <select
                            className="rounded-md border border-gray-300 p-1 text-sm"
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateMemberRole(member.id, e.target.value)
                            }
                          >
                            <option value="admin">管理者</option>
                            <option value="member">メンバー</option>
                            <option value="viewer">閲覧者</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              member.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : member.role === "member"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.role === "admin"
                              ? "管理者"
                              : member.role === "member"
                                ? "メンバー"
                                : "閲覧者"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">メンバーはまだいません</p>
              </div>
            )}
          </div>
        </div>

        {/* テストスイート関連付けセクション */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              関連テストスイート
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                関連テストスイートはまだありません
              </p>
              {isAdmin && (
                <Button className="mt-4">テストスイートを関連付ける</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
