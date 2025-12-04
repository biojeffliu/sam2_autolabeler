"use client"

import * as React from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Minimize,
  Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider } from "@/components/ui/sidebar"

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
}