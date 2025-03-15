import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なページへのアクセス制御
  if (!session && req.nextUrl.pathname.startsWith('/test-suites')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    return NextResponse.redirect(redirectUrl)
  }

  // ログイン済みユーザーの認証ページへのアクセスを制御
  if (session && (
    req.nextUrl.pathname === '/sign-in' ||
    req.nextUrl.pathname === '/sign-up'
  )) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/test-suites'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
