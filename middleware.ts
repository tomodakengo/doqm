import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserDefaultTenant } from './lib/api/tenants'

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value
				},
				set(name: string, value: string, options: any) {
					response.cookies.set({
						name,
						value,
						...options,
					})
				},
				remove(name: string, options: any) {
					response.cookies.set({
						name,
						value: '',
						...options,
					})
				},
			},
		}
	)

	const {
		data: { session },
	} = await supabase.auth.getSession()

	// 認証済みのユーザーのみがアクセスできるページ
	const protectedRoutes = ['/dashboard', '/test-suites']
	const isProtectedRoute = protectedRoutes.some(route =>
		request.nextUrl.pathname.startsWith(route)
	)

	// 認証済みのユーザーはアクセスできないページ（ログイン、サインアップなど）
	const authRoutes = ['/login', '/signup', '/reset-password']
	const isAuthRoute = authRoutes.some(route =>
		request.nextUrl.pathname.startsWith(route)
	)

	// 未認証ユーザーが保護されたルートにアクセスしようとした場合、ログインページにリダイレクト
	if (!session && isProtectedRoute) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// 認証済みユーザーが認証ルート（ログインなど）にアクセスしようとした場合、ダッシュボードにリダイレクト
	if (session && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// 認証済みのユーザーで、保護されたルートにアクセスする場合、デフォルトテナントを確認
	if (session && isProtectedRoute && !request.nextUrl.pathname.startsWith('/tenants/new')) {
		try {
			const defaultTenant = await getUserDefaultTenant(session.user.id)

			// デフォルトテナントがない場合、テナント作成ページにリダイレクト
			if (!defaultTenant && !request.nextUrl.pathname.startsWith('/tenants')) {
				return NextResponse.redirect(new URL('/tenants/new', request.url))
			}
		} catch (error) {
			console.error('Error checking default tenant:', error)
		}
	}

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
