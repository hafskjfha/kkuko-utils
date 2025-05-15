import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 간단한 URL 로깅 미들웨어
export function middleware(request: NextRequest) {
  // 요청 URL 로깅
  console.log('요청 URL:', request.url);
  
  // 추가 정보 로깅 (선택사항)
  console.log('요청 메서드:', request.method);
  console.log('요청 경로:', request.nextUrl.pathname);
  
  // 요청을 수정하지 않고 그대로 다음 단계로 넘김
  return NextResponse.next();
}

// 모든 경로에 적용 (또는 필요한 경로만 지정)
export const config = {
  matcher: [
    /*
     * 모든 사용자 페이지 경로에 대해 적용 (예: '/', '/about', '/dashboard' 등)
     * 정적 파일 및 내부 Next.js 경로 제외
     */
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
