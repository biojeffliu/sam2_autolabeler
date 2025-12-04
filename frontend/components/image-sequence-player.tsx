"use client"

import * as React from "react"
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack, Folder,
  ChevronsLeft,
  ChevronsRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Layers,
  Save,
  Plus,
  RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"
import { toast, useSonner } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ZipUploader } from "@/components/upload-zip"
import { FramePlayer } from "@/components/frame-player"
import { BACKEND_URL } from "@/lib/api"

export function ImageSequencePlayer() {
  const [folders, setFolders] = React.useState<string[]>([])
  const [currentFolder, setCurrentFolder] = React.useState<string>("")
  const [images, setImages] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)


  React.useEffect(() => {
    const fetchFolders = async () => {
      try {
        console.log("Backend URL: ", BACKEND_URL)
        const res = await fetch(`${BACKEND_URL}/api/folders`)
        const data = await res.json()
        setFolders(data.folders || [])
      } catch (err) {
        console.error("Error fetching folders:", err)
        toast("Error", {
          description: "Failed to fetch available folders."
        })
      }
    }
    fetchFolders()
  }, [])

  React.useEffect(() => {
    if (!currentFolder) return
    const fetchImages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/images?folder=${encodeURIComponent(currentFolder)}`)
        if (!res.ok) throw new Error("Failed to fetch images")
        const data = await res.json()
        
        const urls = (data.images ?? []).map(
          (p: string) => `${BACKEND_URL}${p}`
        )
        setImages(urls)

      } catch (err) {
        console.error("Error fetching image URLs:", err)
        toast("Error", {
          description: `Failed to fetch ${currentFolder}`
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchImages()
  }, [currentFolder])


  const handleFolderChange = (value: string) => {
    setCurrentFolder(value)
  }

  const uploadZip = async (file: File) => {
    const form = new FormData()
    form.append("file", file)

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: form
    })

    if (!res.ok) {
      toast("Upload failed", { description: "Could not upload ZIP file." })
      return
    }

    const data = await res.json()
    toast("Uploaded!", { description: `Folder: ${data.folder}` })

    const foldersRes = await fetch(`${BACKEND_URL}/api/folders`)
    const folderData = await foldersRes.json()
    setFolders(folderData.folders)
    setCurrentFolder(data.folder)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Folder Zip Upload */}
      {/* <div className="rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-semibold tracking-wide text-sm">Upload ZIP Folder</p>
            <p className="text-xs text-zinc-400">Zipped folder of frames</p>
          </div>
          <Button
            className="text-black font-semibold hover:bg-[#4dfff1]"
            onClick={() => fileInputRef.current?.click()}
          >Upload</Button>
        </div>
                
      </div> */}
      <ZipUploader
        onUploaded={(folder) => {
          toast("Uploaded", { description: `Loaded ${folder}` })
          fetch(`${BACKEND_URL}/api/folders`)
            .then((res) => res.json())
            .then((data) => {
              setFolders(data.folders)
              setCurrentFolder(folder)
            })
        }}
      />



      {/* Folder Select */}
      <div className="flex items-center gap-2">
        <Folder className="h-4 w-4" />
        <Select
          value={currentFolder}
          onValueChange={handleFolderChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectContent>
              {folders.length === 0 ? (
                <SelectItem value="none" disabled>
                  No folders available
                </SelectItem>
              ) : (
                folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))
              )}
            </SelectContent>

          </SelectTrigger>
        </Select>
      </div>
      {/* Frame Sequence Player */}
      <FramePlayer
        images={images}
      />
    </div>
  )
}
