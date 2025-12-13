"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { useFrameBuffer } from "@/hooks/use-frame-buffer"
import { getClassColor } from "@/lib/cocos-classes"

interface Click {
  x: number
  y: number
  type: "positive" | "negative"
  objectId: string
}

interface SegmentObject {
  id: string
  name: string
  className: string
  labelCount: number
}

interface VideoCanvasProps {
  images: string[]
  currentFrame: number
  clicks: Click[]
  objects: SegmentObject[]
  masks: Record<string, ImageData | null>
  onCanvasClick: (x: number, y: number) => void
}

export function VideoCanvas({ images, currentFrame, clicks, objects, masks, onCanvasClick }: VideoCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { getImage, isReady } = useFrameBuffer(images, currentFrame)

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    onCanvasClick(x, y)
  }

  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || images.length === 0) return

    const image = getImage(currentFrame)
    if (!image) return

    canvas.width = image.width
    canvas.height = image.height

    ctx.drawImage(image, 0, 0)

    objects.forEach((obj) => {
      const mask = masks[obj.id]
      if (mask) {
        const color = getClassColor(obj.className)
        ctx.globalAlpha = 0.4
        ctx.fillStyle = color
        ctx.globalAlpha = 1.0
      }
    })

  }, [currentFrame, images, clicks, objects, masks, getImage, isReady])

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full object-contain cursor-crosshair" />
      {clicks.map((click, index) => (
        <div
          key={index}
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${click.x}px`,
            top: `${click.y}px`,
            color: click.type === "positive" ? "#22c55e" : "#ef4444"
          }}
        >
          <Star className="h-4 w-4 fill-current drop-shadow" />
        </div>
      ))}

      {!isReady && images.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-sm text-muted-foreground">Loading frame...</p>
        </div>
      )}
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a dataset to view</p>
        </div>
      )}
    </div>
  )
}