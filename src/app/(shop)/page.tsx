'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import Hero from '@/components/home/Hero'
import Statement from '@/components/home/Statement'
import FavouritesCarousel from '@/components/home/FavouritesCarousel'
import SubscriptionBanner from '@/components/home/SubscriptionBanner'
import BlogListSection from '@/components/home/BlogListSection'
import WineStory from '@/components/home/WineStory'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  const { config } = useAppConfig()

  return (
    <>
      <Hero />
      <Statement />
      <FavouritesCarousel />
      <div className="mt-24 md:mt-[140px]">
        <BlogListSection />
      </div>
      {config.sections.adBanner && (
        <div className="mt-24 md:mt-[140px]">
          <SubscriptionBanner />
        </div>
      )}
      <div className="mt-24 md:mt-[140px]">
        <WineStory />
      </div>
      <div className="mt-24 md:mt-[140px]">
        <Newsletter />
      </div>
    </>
  )
}
