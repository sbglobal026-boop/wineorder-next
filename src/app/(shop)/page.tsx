import Hero from '@/components/home/Hero'
import Statement from '@/components/home/Statement'
import FavouritesCarousel from '@/components/home/FavouritesCarousel'
import BlogListSection from '@/components/home/BlogListSection'
import { childCategories } from '@/lib/blogCategories'
import WineStory from '@/components/home/WineStory'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <FavouritesCarousel />
      <div className="mt-0">
        <BlogListSection />
      </div>
      {/* Wine / Food & Drink 카테고리별 최신 글 슬라이드 (하위 카테고리 글 포함) */}
      <BlogListSection
        title="Wine"
        titleHref="/blog/wine"
        categories={['wine', ...childCategories('wine')]}
      />
      <BlogListSection
        title="Food & Drink"
        titleHref="/blog/food-drink"
        categories={['food-drink', ...childCategories('food-drink')]}
      />
      <div className="mt-[70px]">
        <WineStory />
      </div>
      <div className="mt-24 md:mt-[140px]">
        <Newsletter />
      </div>
    </>
  )
}
