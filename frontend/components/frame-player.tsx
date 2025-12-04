"use client"
import React, { useRef, useEffect, useState } from "react"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useFrameBuffer } from "@/hooks/use-frame-buffer"

type MarkerType = "positive" | "negative"
interface Marker {
  x: number
  y: number
  type: MarkerType
  frameIndex: number
}

interface FramePlayerProps {
  images: string[]
  initialFps?: number
  markers?: Marker[]
  onAddMarker?: (marker: Marker) => void
}


export function FramePlayer({
  images,
  initialFps = 10,
  markers = [],
  onAddMarker
}: FramePlayerProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)  
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [fps, setFps] = useState(initialFps)
  const [activeTool, setActiveTool] = useState<MarkerType>("positive")
  const [currentFrame, setCurrentFrame] = useState(0)
  const { getImage, isReady } = useFrameBuffer(images, currentFrame)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)


  useEffect(() => {
    if (isPlaying && images.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev: number) => (prev + 1) % images.length)
      }, 1000 / fps)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, fps, images.length, setCurrentFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = getImage(currentFrame)

    if (img) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }

      // A. Draw Frame
      ctx.drawImage(img, 0, 0)

      // B. Draw Markers (Overlay)
      const currentMarkers = markers.filter(m => m.frameIndex === currentFrame)
      currentMarkers.forEach(m => {
        const x = m.x * canvas.width
        const y = m.y * canvas.height
        
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI)
        ctx.fillStyle = m.type === "positive" ? "#4ade80" : "#f87171"
        ctx.lineWidth = 3
        ctx.strokeStyle = "white"
        ctx.fill()
        ctx.stroke()
      })
    } else {
        ctx.fillStyle = "#18181b"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "white"
        ctx.font = "30px sans-serif"
        ctx.fillText("Loading...", 20, 50)
    }
  }, [currentFrame, getImage, markers])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onAddMarker || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    const normalizedX = clickX / rect.width
    const normalizedY = clickY / rect.height
    
    onAddMarker({
      x: normalizedX,
      y: normalizedY,
      type: activeTool,
      frameIndex: currentFrame
    })
  }

  const togglePlay = () => setIsPlaying(p => !p)
  const step = (dir: number) => {
    setIsPlaying(false)
    setCurrentFrame((prev: number) => {
      const next = prev + dir
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }

  const nextFrame = () =>
    setCurrentFrame((prev) => (prev + 1) % images.length)

  const prevFrame = () =>
    setCurrentFrame((prev) => (prev - 1 + images.length) % images.length)

  const firstFrame = () =>
    setCurrentFrame(0)

  const lastFrame = () =>
    setCurrentFrame(images.length - 1)

  // const handleFpsChange = (newFps: number[]) => setFps(newFps[0])

  return (
    <div className="space-y-4 w-full" ref={containerRef}>
      {/* Canvas Area */}
      <canvas 
          ref={canvasRef}
          className="w-full h-auto block cursor-crosshair"
          onClick={handleCanvasClick}
        />
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
            <Button 
                size="icon" 
                variant={activeTool === "positive" ? "default" : "secondary"}
                onClick={() => setActiveTool("positive")}
                className={activeTool === "positive" ? "bg-green-500 hover:bg-green-600" : ""}
            >
                <Plus className="w-4 h-4" />
            </Button>
            <Button 
                size="icon" 
                variant={activeTool === "negative" ? "default" : "secondary"}
                onClick={() => setActiveTool("negative")}
                className={activeTool === "negative" ? "bg-red-500 hover:bg-red-600" : ""}
            >
                <Minus className="w-4 h-4" />
            </Button>
        </div>
        <div className="flex flex-col gap-2">
        <Slider
          value={[currentFrame]}
          max={Math.max(images.length - 1, 0)}
          step={1}
          onValueChange={(v) => { setIsPlaying(false); setCurrentFrame(v[0]); }}
          className="cursor-pointer"
        />
        
        <div className="flex items-center gap-4 w-full">
          <div className="text-sm font-mono text-zinc-400">
            Frame: {currentFrame} / {images.length - 1}
          </div>
          
          <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => step(-1)}><SkipBack className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => step(1)}><SkipForward className="w-4 h-4" /></Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">FPS:</span>
            <Slider value={[fps]}
              min={1}
              max={60}
              step={1}
              onValueChange={(v) => setFps(v[0])}
              className="w-32"
              disabled={images.length === 0}
            />
            <span className="text-sm font-medium w-8">{fps}</span>
          </div>
           
          {/* <div className="w-20" /> */}
        </div>
      </div>
    </div>
  )
}