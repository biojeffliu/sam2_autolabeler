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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SAM2 Autolabeler</h1>
      </div>
      <ImageSequencePlayer />
    </div>
  )
}