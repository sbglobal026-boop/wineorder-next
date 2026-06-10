'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import MainBanner from '@/components/home/MainBanner'
import FeaturedProduct from '@/components/home/FeaturedProduct'
import AdBanner from '@/components/home/AdBanner'

export default function Home() {
  const { config } = useAppConfig()

  return (
    <>
      <MainBanner />
      <FeaturedProduct />
      {config.sections.adBanner && <AdBanner />}
    </>
  )
}
