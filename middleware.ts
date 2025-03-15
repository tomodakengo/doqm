import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 認証が必要なページへのアクセス制御
  if (request.nextUrl.pathname.startsWith('/test-suites')) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/sign-in'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ログイン済みユーザーの認証ページへのアクセスを制御
  if (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up') {
    if (session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/test-suites'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
