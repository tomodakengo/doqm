"use server";

import { createClient } from "@/utils/supabase/server";

// チームの詳細情報を取得するサーバーアクション
export async function getTeamDetails(teamId: string) {
	try {
		const supabase = await createClient();

		// チーム情報を取得
		const { data: team, error: teamError } = await supabase
			.from("teams")
			.select("*")
			.eq("id", teamId)
			.single();

		if (teamError) {
			console.error("Team fetch error:", teamError);
			return { error: teamError.message };
		}

		// チームメンバーを取得
		const { data: members, error: membersError } = await supabase
			.from("team_members")
			.select(`
        id,
        role,
        joined_at,
        user_id,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
			.eq("team_id", teamId);

		if (membersError) {
			console.error("Members fetch error:", membersError);
			return { team, members: [], error: membersError.message };
		}

		return { team, members, error: null };
	} catch (error: any) {
		console.error("Team details error:", error);
		return { error: error.message || "不明なエラー" };
	}
}
