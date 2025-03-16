"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { createTeam, getTeams } from "@/lib/api/supabase";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import CreateTeamModal from "../components/team/CreateTeamModal";

type Team = {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	role?: string;
	members?: number;
};

// Supabaseから返されるデータ型
type TeamMemberResponse = {
	team_id: string;
	role: string;
	teams: {
		id: string;
		name: string;
		description: string | null;
		created_at: string;
		updated_at: string;
	};
};

export default function TeamPage() {
	const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [error, setError] = useState<string | null>(null);
	const supabase = createClient();
	const router = useRouter();

	// チーム一覧を取得する関数
	const fetchTeams = async () => {
		try {
			setLoading(true);

			// ユーザーのチームを取得
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/sign-in");
				return;
			}

			// チームを取得
			const { data: userTeams, error } = await supabase
				.from("team_members")
				.select(
					`
          team_id,
          role,
          teams:team_id (
            id,
            name,
            description,
            created_at,
            updated_at
          )
        `,
				)
				.eq("user_id", user.id);

			if (error) throw error;

			// チームごとのメンバー数を取得
			if (userTeams && userTeams.length > 0) {
				const teamsWithRoles = await Promise.all(
					userTeams.map(async (item: any) => {
						const { count } = await supabase
							.from("team_members")
							.select("id", { count: "exact", head: true })
							.eq("team_id", item.team_id);

						return {
							id: item.teams.id,
							name: item.teams.name,
							description: item.teams.description,
							created_at: item.teams.created_at,
							updated_at: item.teams.updated_at,
							role: item.role,
							members: count || 0,
						} as Team;
					}),
				);

				setTeams(teamsWithRoles);
			} else {
				setTeams([]);
			}
		} catch (error) {
			console.error("Error fetching teams:", error);
			setError("チーム一覧の取得に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTeams();

		// supabaseとrouterを依存配列から除外
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCreateTeam = async (data: {
		name: string;
		description: string;
	}) => {
		try {
			setError(null);
			console.log("Creating team with data:", data);

			// 現在のユーザーが認証されているか確認
			const authResponse = await supabase.auth.getUser();
			const user = authResponse.data?.user;

			if (!user) {
				console.error("No authenticated user found");
				setError("認証情報が見つかりません。再ログインしてください。");
				router.push("/sign-in");
				return;
			}

			// チーム作成（これがサーバーサイドで実行される）
			try {
				await createTeam({
					name: data.name,
					description: data.description,
				});

				router.refresh();
				setIsCreateTeamModalOpen(false);

				// チーム一覧の再取得は成功したらすぐに行う
				fetchTeams();
			} catch (createError: any) {
				console.error("Team creation API error:", createError);
				setError(
					`チーム作成に失敗しました: ${createError.message || "不明なエラー"}`,
				);
			}
		} catch (error: any) {
			console.error("Error in handleCreateTeam:", error);
			setError(`エラーが発生しました: ${error.message || "不明なエラー"}`);
		}
	};

	// 検索フィルター
	const filteredTeams = searchQuery
		? teams.filter(
				(team) =>
					team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(team.description &&
						team.description.toLowerCase().includes(searchQuery.toLowerCase())),
			)
		: teams;

	return (
		<MainLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
					<Button onClick={() => setIsCreateTeamModalOpen(true)}>
						<PlusCircle className="w-4 h-4 mr-2" />
						チームを作成
					</Button>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-2">
						{error}
					</div>
				)}

				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<Input
						className="pl-10"
						placeholder="チーム名で検索..."
						value={searchQuery}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchQuery(e.target.value)
						}
					/>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse"
							>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-full bg-gray-200" />
										<div className="h-5 w-32 bg-gray-200 rounded ml-3" />
									</div>
									<div className="h-5 w-16 bg-gray-200 rounded" />
								</div>
								<div className="h-4 w-full bg-gray-200 rounded mb-4" />
								<div className="flex justify-between items-center">
									<div className="h-4 w-20 bg-gray-200 rounded" />
									<div className="h-8 w-16 bg-gray-200 rounded" />
								</div>
							</div>
						))}
					</div>
				) : filteredTeams.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredTeams.map((team) => (
							<div
								key={team.id}
								className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
											<Users className="w-5 h-5" />
										</div>
										<h3 className="text-lg font-semibold ml-3">{team.name}</h3>
									</div>
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											team.role === "admin"
												? "bg-blue-100 text-blue-800"
												: team.role === "member"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
										}`}
									>
										{team.role === "admin"
											? "管理者"
											: team.role === "member"
												? "メンバー"
												: "閲覧者"}
									</span>
								</div>

								<p className="text-gray-600 text-sm mb-4">
									{team.description || "説明なし"}
								</p>

								<div className="flex justify-between items-center">
									<span className="text-gray-500 text-sm">
										{team.members} メンバー
									</span>
									<div className="flex space-x-2">
										<Link href={`/team/${team.id}`}>
											<Button variant="outline" size="sm">
												詳細を見る
											</Button>
										</Link>
										<Button variant="outline" size="sm">
											<UserPlus className="w-4 h-4 mr-1" />
											招待
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
							<Users className="h-6 w-6 text-gray-500" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-1">
							チームが見つかりません
						</h3>
						<p className="text-gray-500 mb-4">
							チームを作成するか、招待を待ちましょう
						</p>
						<Button onClick={() => setIsCreateTeamModalOpen(true)}>
							新しいチームを作成
						</Button>
					</div>
				)}

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
