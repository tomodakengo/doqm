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
					return document.cookie
						.split("; ")
						.find((row) => row.startsWith(`${name}=`))
						?.split("=")[1];
				},
				set(name, value, options) {
					if (isServer) return;
					document.cookie = `${name}=${value}; path=${options?.path ?? "/"}`;
				},
				remove(name, options) {
					if (isServer) return;
					document.cookie = `${name}=; path=${options?.path ?? "/"}`;
				},
			},
		},
	);
};
