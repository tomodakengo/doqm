"use server";

import {
	createTestCase,
	createTestSuite,
	deleteTestCase,
	deleteTestSuite,
	executeTestCase,
	getTestCaseVersion,
	getTestCaseVersions,
	getTestCases,
	getTestSuiteChildren,
	getTestSuites,
	updateTestCase,
	updateTestSuite,
} from "@/lib/api/supabase";
import { createClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/lib/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { acceptTenantInvitation, createTenant } from "@/lib/api/tenants";

// 招待の詳細を確認するアクション
export const checkInvitationAction = async (token: string) => {
	const supabase = await createClient();

	try {
		// トークンの有効性を確認
		const { data: invitation, error } = await supabase
			.from("tenant_invitations")
			.select("email, role, tenant_id, accepted, expires_at, tenants(name)")
			.eq("token", token)
			.eq("accepted", false)
			.gt("expires_at", new Date().toISOString())
			.single();

		if (error) {
			console.error("招待取得エラー:", error);
			return { success: false, error: "招待情報を取得できません" };
		}

		if (!invitation) {
			return { success: false, error: "無効な招待または期限切れです" };
		}

		return {
			success: true,
			data: {
				email: invitation.email,
				role: invitation.role,
				tenantId: invitation.tenant_id,
				tenantName: invitation.tenants?.name || "不明なテナント"
			}
		};

	} catch (error: any) {
		console.error("招待確認エラー:", error);
		return { success: false, error: error.message || "招待情報の確認に失敗しました" };
	}
};

// 招待付きでサインアップするアクション
export const signUpWithInvitationAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	const token = formData.get("token")?.toString();

	if (!email || !password || !token) {
		return { success: false, error: "必須項目が不足しています" };
	}

	const supabase = await createClient();
	const origin = (await headers()).get("origin");

	try {
		// 招待の有効性を確認
		const invitationCheck = await checkInvitationAction(token);
		if (!invitationCheck.success) {
			return invitationCheck;
		}

		// 招待メールアドレスと入力メールアドレスが一致するか確認
		if (invitationCheck.data.email && invitationCheck.data.email !== email) {
			return { success: false, error: "招待されたメールアドレスと一致しません" };
		}

		// ユーザーを作成
		const { data: authData, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${origin}/auth/callback`,
				data: {
					invitation_token: token,
				}
			}
		});

		if (signUpError) {
			console.error("サインアップエラー:", signUpError);
			return { success: false, error: signUpError.message };
		}

		// ユーザーが作成されていれば、招待を受け入れる処理（サインアップ確認後に実行されるように）
		// 注意: 実際にはuserがいろいろな理由で空になっている可能性があるので、エラーとしては扱わない
		if (authData.user) {
			try {
				// このタイミングで招待を受け入れるのは早すぎるので、
				// 実際の招待受け入れ処理は認証コールバック後に行う

				// データベースに処理待ちのフラグを立てる
				await supabase.from("auth_metadata").insert({
					user_id: authData.user.id,
					metadata: {
						invitation_token: token,
						status: "pending"
					}
				});

			} catch (acceptError: any) {
				console.error("招待承諾エラー:", acceptError);
				// ここでエラーが発生してもサインアップ自体は成功とする
			}
		}

		return { success: true };

	} catch (error: any) {
		console.error("招待サインアップエラー:", error);
		return { success: false, error: error.message || "サインアップ処理中にエラーが発生しました" };
	}
};

export const signUpAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");

	if (!email || !password) {
		return encodedRedirect(
			"error",
			"/sign-up",
			"Email and password are required",
		);
	}

	// ユーザー作成（テナント作成はなし）
	const { data: authData, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		console.error(`${error.code} ${error.message}`);
		return encodedRedirect("error", "/sign-up", error.message);
	}

	return encodedRedirect(
		"success",
		"/sign-in",
		"Thanks for signing up! Please check your email for a verification link.",
	);
};

export const signInAction = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return encodedRedirect("error", "/sign-in", error.message);
	}

	// ユーザーのテナント情報を取得
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			// テナントユーザー情報を取得
			const { data: tenantUsers, count } = await supabase
				.from("tenant_users")
				.select("tenant_id", { count: "exact" })
				.eq("user_id", user.id);

			// テナントが存在しない場合はテナント作成ページへ
			if (!tenantUsers || tenantUsers.length === 0) {
				return redirect("/tenants/create");
			}

			// テナントが1つだけの場合は自動的にリダイレクト
			if (tenantUsers.length === 1) {
				return redirect(`/${tenantUsers[0].tenant_id}/dashboard`);
			}

			// 複数テナントがある場合はテナント選択画面へ
			return redirect("/tenants");
		}
	} catch (err) {
		console.error("テナント情報取得エラー:", err);
	}

	// エラーが発生した場合もテナント選択画面へ
	return redirect("/tenants");
};

export const forgotPasswordAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");
	const callbackUrl = formData.get("callbackUrl")?.toString();

	if (!email) {
		return encodedRedirect("error", "/forgot-password", "Email is required");
	}

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
	});

	if (error) {
		console.error(error.message);
		return encodedRedirect(
			"error",
			"/forgot-password",
			"Could not reset password",
		);
	}

	if (callbackUrl) {
		return redirect(callbackUrl);
	}

	return encodedRedirect(
		"success",
		"/forgot-password",
		"Check your email for a link to reset your password.",
	);
};

export const resetPasswordAction = async (formData: FormData) => {
	const supabase = await createClient();

	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (!password || !confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Password and confirm password are required",
		);
	}

	if (password !== confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Passwords do not match",
		);
	}

	const { error } = await supabase.auth.updateUser({
		password: password,
	});

	if (error) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Password update failed",
		);
	}

	encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	return redirect("/sign-in");
};

/**
 * テストケースのバージョン履歴を取得する
 */
export async function getTestCaseVersionHistory(testCaseId: string) {
	try {
		const versions = await getTestCaseVersions(testCaseId);
		return { success: true, data: versions };
	} catch (error) {
		console.error("テストケースのバージョン履歴取得エラー:", error);
		return {
			success: false,
			error: "テストケースのバージョン履歴の取得中にエラーが発生しました",
		};
	}
}

/**
 * テストケースの特定バージョンを取得する
 */
export async function getSpecificTestCaseVersion(versionId: string) {
	try {
		const version = await getTestCaseVersion(versionId);
		return { success: true, data: version };
	} catch (error) {
		console.error("テストケースバージョンの取得エラー:", error);
		return {
			success: false,
			error: "テストケースバージョンの取得中にエラーが発生しました",
		};
	}
}
