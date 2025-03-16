import { createClient as createServerClientOriginal } from "./server";

// App Routerディレクトリ専用のクライアント取得関数
export async function createAppClient() {
    return await createServerClientOriginal();
} 