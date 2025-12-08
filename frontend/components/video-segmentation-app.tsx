"use client"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger } from "@/components/ui/tabs"
import { ImageSequencePlayer } from "@/components/image-sequence-player"

export function VideoSegmentationApp() {
  return (
    <div className="container mx-auto p-8">
      <ImageSequencePlayer />
    </div>
  )
}