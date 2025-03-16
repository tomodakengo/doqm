import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
	try {
		// Create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
			{
				cookies: {
					getAll() {
						return request.cookies.getAll();
					},
					setAll(cookiesToSet) {
						for (const { name, value } of cookiesToSet) {
							request.cookies.set(name, value);
						}
						response = NextResponse.next({
							request,
						});
						for (const { name, value, options } of cookiesToSet) {
							response.cookies.set(name, value, options);
						}
					},
				},
			},
		);

		// This will refresh session if expired - required for Server Components
		// https://supabase.com/docs/guides/auth/server-side/nextjs
		const { data: { user } } = await supabase.auth.getUser();

		// 認証不要のパスリスト
		const publicPaths = [
			"/",
			"/sign-in",
			"/sign-up",
			"/forgot-password",
			"/auth/callback",
		];

		// パスが公開パスかどうかをチェック
		const isPublicPath = publicPaths.some(
			(path) =>
				request.nextUrl.pathname === path ||
				request.nextUrl.pathname.startsWith(`${path}/`),
		);

		// 認証保護 - 公開パス以外のすべてのパスは認証が必要
		if (!isPublicPath && !user) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		if (request.nextUrl.pathname === "/" && user) {
			return NextResponse.redirect(new URL("/test-suites", request.url));
		}

		return response;
	} catch (e) {
		console.error("Supabase middleware error:", e);

		// エラーが発生した場合もパブリックパスへのアクセスは許可する
		const publicPaths = ["/", "/sign-in", "/sign-up", "/forgot-password", "/auth/callback"];
		const isPublicPath = publicPaths.some(
			(path) =>
				request.nextUrl.pathname === path ||
				request.nextUrl.pathname.startsWith(`${path}/`)
		);

		if (!isPublicPath) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
