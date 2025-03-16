import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { acceptTenantInvitation } from "@/lib/api/tenants";

export async function GET(request: Request) {
	// The `/auth/callback` route is required for the server-side auth flow implemented
	// by the SSR package. It exchanges an auth code for the user's session.
	// https://supabase.com/docs/guides/auth/server-side/nextjs
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const origin = requestUrl.origin;
	const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

	if (code) {
		const supabase = await createClient();
		// コードを交換してセッションを取得
		await supabase.auth.exchangeCodeForSession(code);

		// ユーザー情報を取得
		const { data: { user } } = await supabase.auth.getUser();

		// 招待で登録したユーザーが保留中の招待トークンを持っているか確認する
		if (user) {
			try {
				// auth_metadataテーブルから招待情報を取得
				const { data: metadata, error } = await supabase
					.from("auth_metadata")
					.select("metadata")
					.eq("user_id", user.id)
					.eq("metadata->status", "pending")
					.maybeSingle();

				if (metadata && metadata.metadata && metadata.metadata.invitation_token) {
					// 招待トークンがあれば受け入れ処理
					try {
						await acceptTenantInvitation(metadata.metadata.invitation_token);

						// 処理済みとしてマーク
						await supabase
							.from("auth_metadata")
							.update({
								metadata: {
									...metadata.metadata,
									status: "completed"
								}
							})
							.eq("user_id", user.id);

					} catch (acceptError) {
						console.error("招待受け入れエラー:", acceptError);
					}
				}

				// テナント情報を取得
				const { data: tenantUsers } = await supabase
					.from("tenant_users")
					.select("tenant_id")
					.eq("user_id", user.id)
					.limit(1);

				// テナントがあればリダイレクト先を変更
				if (tenantUsers && tenantUsers.length > 0) {
					return NextResponse.redirect(`${origin}/${tenantUsers[0].tenant_id}/dashboard`);
				}
			} catch (err) {
				console.error("メタデータ取得エラー:", err);
			}
		}
	}

	if (redirectTo) {
		return NextResponse.redirect(`${origin}${redirectTo}`);
	}

	// ユーザーがテナントを持っているかを確認し、リダイレクト先を決定
	// ここではシンプルに/tenantsへリダイレクト（ログイン後にチェック＆リダイレクト）
	return NextResponse.redirect(`${origin}/tenants`);
}
