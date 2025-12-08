import Head from "next/head"
import type { AppProps } from "next/app"
import { AppSidebar } from "@/components/app-sidebar"
import { VideoSegmentationApp } from "@/components/video-segmentation-app"

export default function Page() {
  return (
    
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <VideoSegmentationApp />
    </div>
  )
}