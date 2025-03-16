import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createAPIClient } from "@/lib/supabase/server-api";
import { Database } from "../types/database.types";

// クライアントを適切に取得する関数
const getClientForAPI = async () => {
	try {
		// サーバーサイドでのみ実行される場合
		if (typeof window === "undefined") {
			// サーバーサイドではAPI用クライアントを使用
			return createAPIClient();
		} else {
			// クライアントサイドの場合（ブラウザ環境）
			return createBrowserClient();
		}
	} catch (error) {
		console.error("Supabaseクライアント作成エラー:", error);
		// エラーが発生した場合、APIクライアントで代替
		return createAPIClient();
	}
};

// Supabaseクライアントを取得する関数
async function getSupabaseClient() {
	return await getClientForAPI();
}

/**
 * テストスイート関連のAPI関数
 */
export async function getTestSuites() {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("test_suites")
		.select("*")
		.is("parent_id", null)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getTestSuiteChildren(parentId: string) {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("test_suites")
		.select("*")
		.eq("parent_id", parentId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getTestCases(suiteId: string) {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("test_cases")
		.select("*")
		.eq("suite_id", suiteId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function createTestSuite(data: {
	name: string;
	description?: string;
	parent_id?: string;
}) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("test_suites").insert([
		{
			name: data.name,
			description: data.description,
			parent_id: data.parent_id,
		},
	]);

	if (error) throw error;
	return true;
}

export async function updateTestSuite(
	id: string,
	data: { name?: string; description?: string; status?: string },
) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase
		.from("test_suites")
		.update({
			name: data.name,
			description: data.description,
			status: data.status,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) throw error;
	return true;
}

export async function deleteTestSuite(id: string) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("test_suites").delete().eq("id", id);

	if (error) throw error;
	return true;
}

/**
 * テストケース関連のAPI関数
 */
export async function createTestCase(data: {
	suite_id: string;
	title: string;
	description?: string;
	preconditions?: string;
	steps?: string[];
	expected_result?: string;
	priority?: string;
}) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("test_cases").insert([
		{
			suite_id: data.suite_id,
			title: data.title,
			description: data.description,
			preconditions: data.preconditions,
			steps: data.steps,
			expected_result: data.expected_result,
			priority: data.priority || "medium",
		},
	]);

	if (error) throw error;
	return true;
}

export async function updateTestCase(
	id: string,
	data: {
		title?: string;
		description?: string;
		preconditions?: string;
		steps?: string[];
		expected_result?: string;
		priority?: string;
		status?: string;
	},
) {
	const supabase = await getSupabaseClient();

	// 現在のバージョンを取得
	const { data: currentData, error: fetchError } = await supabase
		.from("test_cases")
		.select("*")
		.eq("id", id)
		.single();

	if (fetchError) throw fetchError;

	// バージョン履歴に保存（更新がある場合のみ）
	if (
		data.title !== currentData.title ||
		data.description !== currentData.description ||
		data.preconditions !== currentData.preconditions ||
		JSON.stringify(data.steps) !== JSON.stringify(currentData.steps) ||
		data.expected_result !== currentData.expected_result ||
		data.priority !== currentData.priority
	) {
		// 現在のバージョン番号を取得し、増分する
		const currentVersion = currentData.version || "1.0";
		const versionParts = currentVersion.split(".");
		const newVersion = `${versionParts[0]}.${Number(versionParts[1]) + 1}`;

		// バージョン履歴に保存
		const { error: versionError } = await supabase
			.from("test_case_versions")
			.insert([
				{
					test_case_id: id,
					version: currentVersion,
					title: currentData.title,
					description: currentData.description,
					preconditions: currentData.preconditions,
					steps: currentData.steps,
					expected_result: currentData.expected_result,
					priority: currentData.priority,
				},
			]);

		if (versionError) throw versionError;

		// テストケースを更新
		const { error: updateError } = await supabase
			.from("test_cases")
			.update({
				title: data.title,
				description: data.description,
				preconditions: data.preconditions,
				steps: data.steps,
				expected_result: data.expected_result,
				priority: data.priority,
				status: data.status,
				version: newVersion,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (updateError) throw updateError;
	} else {
		// 内容の変更がない場合はバージョン履歴を作成せず、ステータスのみ更新
		const { error: updateError } = await supabase
			.from("test_cases")
			.update({
				status: data.status,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (updateError) throw updateError;
	}

	return true;
}

export async function deleteTestCase(id: string) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("test_cases").delete().eq("id", id);

	if (error) throw error;
	return true;
}

export async function executeTestCase(data: {
	test_case_id: string;
	result: string;
	notes?: string;
	environment?: string;
}) {
	const supabase = await getSupabaseClient();

	// 実行履歴に追加
	const { error: historyError } = await supabase
		.from("execution_history")
		.insert([
			{
				test_case_id: data.test_case_id,
				result: data.result,
				notes: data.notes,
				environment: data.environment,
			},
		]);

	if (historyError) throw historyError;

	// テストケースのステータスを更新
	const { error: updateError } = await supabase
		.from("test_cases")
		.update({
			status: data.result,
			updated_at: new Date().toISOString(),
		})
		.eq("id", data.test_case_id);

	if (updateError) throw updateError;

	return true;
}

/**
 * テストケースバージョン関連のAPI関数
 */
export async function getTestCaseVersions(testCaseId: string) {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("test_case_versions")
		.select("*")
		.eq("test_case_id", testCaseId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getTestCaseVersion(versionId: string) {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("test_case_versions")
		.select("*")
		.eq("id", versionId)
		.single();

	if (error) throw error;
	return data;
}

/**
 * チーム関連のAPI関数
 */
export async function getTeams() {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
		.from("teams")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getTeamMembers(teamId: string) {
	const supabase = await getSupabaseClient();
	const { data, error } = await supabase
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

	if (error) throw error;
	return data;
}

export async function createTeam(data: { name: string; description?: string }) {
	try {
		console.log("Creating team with data:", data);

		const supabase = await getSupabaseClient();

		// 現在のユーザーを取得
		const userResponse = await supabase.auth.getUser();
		console.log("User auth response:", userResponse);

		// ユーザー情報がない場合はエラーを返す
		if (!userResponse.data?.user?.id) {
			const error = new Error("認証されていないユーザーです");
			console.error("Authentication error:", error);
			throw error;
		}

		const userId = userResponse.data.user.id;

		// チームを作成
		const { data: team, error } = await supabase
			.from("teams")
			.insert([
				{
					name: data.name,
					description: data.description,
					created_by: userId,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Team creation error:", error);
			throw error;
		}

		console.log("Team created:", team);

		// 作成者を管理者として自動追加
		const { error: memberError } = await supabase.from("team_members").insert([
			{
				team_id: team.id,
				user_id: userId,
				role: "admin",
			},
		]);

		if (memberError) {
			console.error("Adding team member error:", memberError);
			throw memberError;
		}

		return team;
	} catch (error) {
		console.error("Complete error in createTeam:", error);
		throw error;
	}
}

export async function updateTeam(
	id: string,
	data: { name?: string; description?: string },
) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase
		.from("teams")
		.update({
			name: data.name,
			description: data.description,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);

	if (error) throw error;
	return true;
}

export async function deleteTeam(id: string) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("teams").delete().eq("id", id);

	if (error) throw error;
	return true;
}

export async function addTeamMember(data: {
	team_id: string;
	user_id: string;
	role: "admin" | "member" | "viewer";
}) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("team_members").insert([data]);

	if (error) throw error;
	return true;
}

export async function updateTeamMemberRole(
	id: string,
	role: "admin" | "member" | "viewer",
) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase
		.from("team_members")
		.update({ role })
		.eq("id", id);

	if (error) throw error;
	return true;
}

export async function removeTeamMember(id: string) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("team_members").delete().eq("id", id);

	if (error) throw error;
	return true;
}

export async function associateTestSuiteWithTeam(data: {
	team_id: string;
	test_suite_id: string;
}) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase.from("team_test_suites").insert([data]);

	if (error) throw error;
	return true;
}

export async function removeTestSuiteFromTeam(
	teamId: string,
	testSuiteId: string,
) {
	const supabase = await getSupabaseClient();
	const { error } = await supabase
		.from("team_test_suites")
		.delete()
		.eq("team_id", teamId)
		.eq("test_suite_id", testSuiteId);

	if (error) throw error;
	return true;
}
