import { createBrowserClient } from "@supabase/ssr";

// Pages Router用のクライアント
export const createClient = () => {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
	);
};
