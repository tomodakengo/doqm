import { createClient as createServerClientOriginal } from "./server";

// App Routerディレクトリ専用のクライアント取得関数
export async function createAppClient() {
	try {
		return await createServerClientOriginal();
	} catch (error) {
		console.error("App client creation error:", error);
		throw error;
	}
}
