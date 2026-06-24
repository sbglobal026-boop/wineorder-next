import Hero from '@/components/home/Hero'
import Statement from '@/components/home/Statement'
import FavouritesCarousel from '@/components/home/FavouritesCarousel'
import BlogListSection from '@/components/home/BlogListSection'
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
      <div className="mt-[70px]">
        <WineStory />
      </div>
      <div className="mt-24 md:mt-[140px]">
        <Newsletter />
      </div>
    </>
  )
}
