export type Product = {
  id: number
  name: string
  price: number
  EK: number /* 원가 */
  margin: number
  type: 'wine' | 'food'
  category: '레드' | '화이트' | '로제' | '스파클링' | '식품'
  origin: string
  rating: number
  description: string
  imageUrl?: string
  extraImages?: string[]
  criticRatings?: string
  grapeVariety?: string
}

export type FixedCost = {
  id: number
  name: string
  amount: number
}

export const products: Product[] = [
  { id: 1, name: "샤또 마고 2018", price: 320000, EK: 0, margin: 0, type: 'wine', category: "레드", origin: "프랑스", rating: 4.9, description: "보르도의 왕이라 불리는 명품 레드와인" },
  { id: 2, name: "오퍼스 원 2020", price: 580000, EK: 0, margin: 0, type: 'wine', category: "레드", origin: "미국", rating: 4.8, description: "나파밸리 최고의 카베르네 소비뇽" },
  { id: 3, name: "킴 크로포드 소비뇽 블랑", price: 35000, EK: 0, margin: 0, type: 'wine', category: "화이트", origin: "뉴질랜드", rating: 4.5, description: "신선한 허브향의 인기 화이트와인" },
  { id: 4, name: "모엣 샹동 임페리얼", price: 89000, EK: 0, margin: 0, type: 'wine', category: "스파클링", origin: "프랑스", rating: 4.7, description: "세계에서 가장 사랑받는 샴페인" },
  { id: 5, name: "안티노리 티냐넬로", price: 145000, EK: 0, margin: 0, type: 'wine', category: "레드", origin: "이탈리아", rating: 4.8, description: "슈퍼 투스칸의 아이콘" },
  { id: 6, name: "그르기치 힐스 샤르도네", price: 78000, EK: 0, margin: 0, type: 'wine', category: "화이트", origin: "미국", rating: 4.6, description: "1976 파리의 심판 우승 와인" },
  { id: 7, name: "루이 로드레 크리스탈", price: 320000, EK: 0, margin: 0, type: 'wine', category: "스파클링", origin: "프랑스", rating: 4.9, description: "황제를 위해 만들어진 프레스티지 샴페인" },
  { id: 8, name: "코스 데스투르넬 로제", price: 65000, EK: 0, margin: 0, type: 'wine', category: "로제", origin: "프랑스", rating: 4.5, description: "우아하고 섬세한 프로방스 로제" },
]
