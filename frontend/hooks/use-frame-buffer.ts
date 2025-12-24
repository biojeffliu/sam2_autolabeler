import { useEffect, useMemo, useRef, useState } from "react"

type FrameBitmapCache = Map<number, ImageBitmap>
type InflightBitmapCache = Map<number, Promise<ImageBitmap | null>>

const DEFAULT_PREFETCH_RADIUS = 60
const DEFAULT_MAX_CACHE = 180
const PREFETCH_CONCURRENCY = 6

export function useFrameBuffer(
  images: string[],
  currentFrame: number,
  bufferRadius = DEFAULT_PREFETCH_RADIUS,
  maxCache = DEFAULT_MAX_CACHE
) {
  const bitmapCache = useRef<FrameBitmapCache>(new Map())
  const inflight = useRef<InflightBitmapCache>(new Map())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    bitmapCache.current.clear()
    inflight.current.clear()

    setIsReady(false)
  }, [images])

  const loadFrame = useMemo(
    () =>
      async (frameIdx: number) => {
        if (frameIdx < 0 || frameIdx >= images.length) return null

        if (bitmapCache.current.has(frameIdx)) {
          return bitmapCache.current.get(frameIdx)!
        }

        if (inflight.current.has(frameIdx)) {
          return inflight.current.get(frameIdx)!
        }
        const src = images[frameIdx]
        console.log("Fetching frame", frameIdx, src)
        if (!src) return null

        const loadPromise = fetch(src)
          .then((res) => res.blob())
          .then((blob) => createImageBitmap(blob))
          .then((bitmap) => {
            inflight.current.delete(frameIdx)
            bitmapCache.current.set(frameIdx, bitmap)
            return bitmap
          })
          .catch((err) => {
            inflight.current.delete(frameIdx)
            console.error("Failed to load frame", frameIdx, err)
            return null
          })

        inflight.current.set(frameIdx, loadPromise)
        return loadPromise
      },
      [images]
  )

  useEffect(() => {
    let cancelled = false
    const start = Math.max(0, currentFrame - Math.floor(bufferRadius / 2))
    const end = Math.min(images.length - 1, currentFrame + bufferRadius)
    const framesToFetch: number[] = []

    for (let i = start; i <= end; i++) {
      if (bitmapCache.current.has(i)) continue
      framesToFetch.push(i)
    }

    const prefetch = async () => {
      for (let i = 0; i < framesToFetch.length; i += PREFETCH_CONCURRENCY) {
        if (cancelled) return
        const batch = framesToFetch.slice(i, i + PREFETCH_CONCURRENCY)
        await Promise.all(batch.map((idx) => loadFrame(idx))).catch(() => null)
      }
    }

    loadFrame(currentFrame)?.then((bitmap) => {
      if (!cancelled && bitmap) setIsReady(true)
    })
    prefetch()

    return () => {
      cancelled = true
    }
  }, [images, currentFrame, bufferRadius, loadFrame])

  useEffect(() => {
    const lowerBound = Math.max(0, currentFrame - maxCache)
    const upperBound = Math.min(images.length - 1, currentFrame + maxCache)

    bitmapCache.current.forEach((bitmap, idx) => {
      if (idx < lowerBound || idx > upperBound) {
        if ("close" in bitmap && typeof bitmap.close === "function") {
          bitmap.close()
        }
        bitmapCache.current.delete(idx)
      }
    })
  }, [currentFrame, maxCache, images.length])

  return {
    getImage: (index: number) => bitmapCache.current.get(index),
    isReady,
  }
}