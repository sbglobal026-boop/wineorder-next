import { NextRequest } from 'next/server'

// 구글맵 단축 URL만 풀어주는 용도. 그 외 URL을 서버가 대신 요청하게 두면
// 내부망/클라우드 메타데이터 주소 등으로 요청을 보내게 만드는 SSRF 통로가 되므로 화이트리스트로 제한.
const ALLOWED_HOST_RE = /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'url required' }, { status: 400 })
  if (!ALLOWED_HOST_RE.test(url)) return Response.json({ error: 'unsupported url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    return Response.json({ resolved: res.url })
  } catch {
    return Response.json({ error: 'failed to resolve' }, { status: 500 })
  }
}
