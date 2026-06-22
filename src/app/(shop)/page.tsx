'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import Hero from '@/components/home/Hero'
import Statement from '@/components/home/Statement'
import FavouritesCarousel from '@/components/home/FavouritesCarousel'
import SubscriptionBanner from '@/components/home/SubscriptionBanner'
import CategoriesGrid from '@/components/home/CategoriesGrid'
import WineStory from '@/components/home/WineStory'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  const { config } = useAppConfig()

  return (
    <>
      <Hero />
      <Statement />
      <FavouritesCarousel />
      <CategoriesGrid />
      {config.sections.adBanner && <SubscriptionBanner />}
      <WineStory />
      <Newsletter />
    </>
  )
}
