// /app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.getSession() // 이 호출로 자동 쿠키 세팅됨

  // 로그인 후 홈으로 리디렉션
  return NextResponse.redirect(new URL('/', request.url))
}
