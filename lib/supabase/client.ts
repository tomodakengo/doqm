import { createBrowserClient } from "@supabase/ssr";

// Pages Router用のクライアント
export const createClient = () => {
	// サーバーサイドでの実行を検出
	const isServer = typeof window === "undefined";

	// クライアントサイド用のブラウザクライアント作成
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
		{
			cookies: {
				get(name) {
					if (isServer) {
						// サーバーサイドでは空を返す
						return undefined;
					}
					// Cookieを探索して値を取得
					const cookies = document.cookie.split(";").map((c) => c.trim());
					const cookie = cookies.find((c) => c.startsWith(`${name}=`));
					if (!cookie) return undefined;
					return decodeURIComponent(cookie.split("=")[1]);
				},
				set(name, value, options) {
					if (isServer) return;
					// 有効期限などのオプションを適切に設定
					let cookie = `${name}=${encodeURIComponent(value)}; path=${options?.path ?? "/"}`;
					if (options?.maxAge) {
						cookie += `; max-age=${options.maxAge}`;
					}
					if (options?.domain) {
						cookie += `; domain=${options.domain}`;
					}
					if (options?.sameSite) {
						cookie += `; samesite=${options.sameSite}`;
					}
					if (options?.secure) {
						cookie += "; secure";
					}
					document.cookie = cookie;
				},
				remove(name, options) {
					if (isServer) return;
					// Cookieを削除するため、有効期限を過去に設定
					document.cookie = `${name}=; path=${options?.path ?? "/"}; max-age=0`;
				},
			},
		},
	);
};
