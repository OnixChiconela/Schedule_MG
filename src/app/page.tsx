
"use client"
import dynamic from 'next/dynamic'
import SideNavbar from './components/navbars/SideNavbar'

const ThreeCanvas = dynamic(() => import('@/app/components/canvas/ThreeCanvas'), { ssr: false })

export default function Home() {
  return (
    <main className="flex h-screen">
    <SideNavbar />
    <div className="flex-1 ml-60">
      <ThreeCanvas />
    </div>
  </main>
  )
}