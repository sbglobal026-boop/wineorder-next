import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

// 상품 편집의 "자동 채우기" — 상품명 등 입력값을 바탕으로 Claude가 나머지 칸을 채워줌
// 판매가·별점·평론가 점수·재고·배송비는 다루지 않음 (사람이 정하거나 지어내면 안 되는 값)

const WINE_CATEGORIES = ['레드', '화이트', '로제', '스파클링'] as const

// Claude가 돌려줄 형식 — 모르는 값은 빈 문자열로 두게 함
const FilledProductSchema = z.object({
  category: z.string().describe('레드·화이트·로제·스파클링 중 하나. 식품이면 식품'),
  origin: z.string().describe('생산 국가만 한국어로 (예: 프랑스). 모르면 빈 문자열'),
  wineryName: z.string().describe('아래 목록에 있는 와이너리 이름과 정확히 일치해야 함. 해당 없으면 빈 문자열'),
  grapeVariety: z.string().describe('포도 품종을 한국어로, 여러 개면 쉼표로 구분. 모르면 빈 문자열'),
  volume: z.string().describe('용량 숫자만 (예: 750). 표준 병이면 750'),
  alcohol: z.string().describe(
    '알코올 도수 숫자만 (예: 12.5). 라벨 수치를 정확히 모르더라도 ' +
    '해당 와인 종류·등급의 일반적인 도수를 적을 것 (비워두지 말 것). ' +
    '추정한 경우 uncertain 목록에 alcohol을 넣을 것'
  ),
  description: z.string().describe(
    '한국어 상품 설명. 400~700자. 빈 줄로 구분한 4개 문단: ' +
    '(1) 생산자와 산지 배경 (2) 포도밭·양조 방식이나 빈티지 특징 ' +
    '(3) 향과 맛 — 첫인상, 중간 풍미, 여운 순서로 구체적으로 ' +
    '(4) 마시는 방법 — 적정 온도, 잔, 어울리는 음식. ' +
    '점수·가격·수상 이력은 쓰지 말 것. 확실하지 않은 숫자는 쓰지 말고 일반적인 표현으로'
  ),
  uncertain: z.array(z.string()).describe('확신이 낮은 항목 이름들 (category·origin·grapeVariety·volume·alcohol 중)'),
})

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: '상품명을 먼저 입력해주세요' }, { status: 400 })

  // 와이너리는 등록된 것 중에서만 고르게 함 (없는 이름을 지어내지 않도록)
  const supabase = createAdminClient()
  const { data: wineries } = await supabase.from('wineries').select('id, name, country, region, description').order('name')
  const wineryNames = (wineries ?? []).map(w => w.name)

  // 이미 고른 와이너리가 있으면 그 소개글을 함께 넘겨 설명의 정확도를 높임
  const selectedWinery = (wineries ?? []).find(w => w.id === Number(body.wineryId))

  const type = body.type === 'food' ? 'food' : 'wine'
  const known = [
    body.origin ? `원산지: ${body.origin}` : null,
    body.category ? `카테고리: ${body.category}` : null,
    body.grapeVariety ? `포도품종: ${body.grapeVariety}` : null,
    body.volume ? `용량: ${body.volume}ml` : null,
    body.alcohol ? `알코올: ${body.alcohol}%` : null,
  ].filter(Boolean).join('\n')

  const client = new Anthropic()

  try {
    const response = await client.messages.parse({
      model: 'claude-sonnet-5',
      max_tokens: 8000,
      system: [
        '너는 한국 와인 수입사의 상품 등록 담당자다.',
        '주어진 상품명으로 상품 정보를 채운다.',
        '확실하지 않으면 지어내지 말고 빈 문자열로 두고, uncertain 목록에 항목 이름을 넣어라.',
        '평론가 점수·가격·재고는 절대 만들어내지 마라.',
        '단, 알코올 도수와 용량은 비워두지 말고 해당 종류의 일반적인 값이라도 채운 뒤 uncertain에 표시해라.',
        '설명은 한국어 존댓말로 쓰되, 와인을 처음 보는 손님도 이해할 수 있게 구체적으로 쓴다.',
        '"최고의", "세계적인" 같은 과장 대신 실제 특징을 설명한다.',
        '모르는 사실은 쓰지 말고, 아는 범위에서 충분히 자세히 쓴다.',
      ].join(' '),
      messages: [{
        role: 'user',
        content: [
          `상품명: ${name}`,
          `구분: ${type === 'wine' ? '와인' : '식품'}`,
          known ? `이미 입력된 정보(우선 존중):\n${known}` : '이미 입력된 정보: 없음',
          `와인 카테고리 선택지: ${WINE_CATEGORIES.join(', ')}`,
          wineryNames.length > 0
            ? `등록된 와이너리 목록(이 중에서만 고를 것): ${wineryNames.join(', ')}`
            : '등록된 와이너리 없음 — wineryName은 빈 문자열로 둘 것',
          selectedWinery
            ? `이미 선택된 와이너리 정보(설명 작성에 활용):\n이름: ${selectedWinery.name}\n지역: ${[selectedWinery.country, selectedWinery.region].filter(Boolean).join(' ')}\n소개: ${selectedWinery.description || '없음'}`
            : '',
        ].join('\n\n'),
      }],
      output_config: { format: zodOutputFormat(FilledProductSchema) },
    })

    const filled = response.parsed_output
    if (!filled) return NextResponse.json({ error: 'AI 응답을 해석하지 못했습니다' }, { status: 502 })

    // 목록에 없는 와이너리 이름은 버림
    const wineryName = wineryNames.includes(filled.wineryName) ? filled.wineryName : ''

    return NextResponse.json({ ...filled, wineryName })
  } catch (err) {
    const message = err instanceof Error ? err.message : '자동 채우기에 실패했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
