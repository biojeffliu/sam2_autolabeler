"use client"

import * as React from "react"
import { BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"

export interface FolderMetadata {
  name: string
  objects: Record<string, number>
  description: string
  upload_date: string
  num_frames: number
  width: number
  height: number
}

export function useFetchFolders() {
  const [folders, setFolders] = React.useState<FolderMetadata[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchFolders = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/folders`)
      if (!res.ok) throw new Error("Failed to connect to backend")
      const data = await res.json()
      setFolders(data.folders || [])
    } catch (err) {
      console.error("Error fetching folders:", err)
      setError("Failed to fetch folders")
      toast("Error", {
        description: "Failed to fetch available folders."
      })
    } finally {
      setIsLoading(false)
    }
  }, [])
  React.useEffect(() => {
    fetchFolders()
  }, [fetchFolders])
  const folderNames = React.useMemo(() => folders.map(f => f.name), [folders])

  const folderMap = React.useMemo<Record<string, FolderMetadata>>(
    () =>
      folders.reduce((acc, folder) => {
        acc[folder.name] = folder
        return acc
      }, {} as Record<string, FolderMetadata>),
    [folders]
  )

  return { folders, folderMap, folderNames, isLoading, error, refetch: fetchFolders }
}

export function useFetchImages(folderName: string) {
  const [images, setImages] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchImages = React.useCallback(async () => {
    if (!folderName) {
      setImages([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`${BACKEND_URL}/api/images?folder=${encodeURIComponent(folderName)}`)
      if (!res.ok) throw new Error("Failed to fetch images")
      const data = await res.json()
      
      const urls = (data.images ?? []).map(
        (p: string) => `${BACKEND_URL}${p}`
      )
      setImages(urls)

    } catch (err) {
      console.error("Error fetching image URLs:", err)
      setError("Failed to load images")
      toast("Error", {
        description: `Failed to fetch ${folderName}`
      })
    } finally {
      setIsLoading(false)
    }
  }, [folderName])

  React.useEffect(() => {
    fetchImages()
  }, [fetchImages])
  return { images, isLoading, error, refetch: fetchImages }
}

export function useDeleteFolder() {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const deleteFolder = React.useCallback(async (folderName: string) => {
    setIsDeleting(true)
    setError(null)

    try {
      const params = new URLSearchParams({ folder: folderName })
      const res = await fetch(`${BACKEND_URL}/api/folders/delete?${params}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Failed to delete folder")
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error("Delete error:", message)
      setError(message)
      
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])
  return { deleteFolder, isDeleting, error }
}

export function useRenameFolder() {
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const renameFolder = React.useCallback(async (oldName: string, newName: string) => {
    setIsRenaming(true)
    setError(null)

    try {
      const res = await fetch(`${BACKEND_URL}/api/folders/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_name: oldName,
          new_name: newName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Failed to rename folder")
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error("Rename error:", message)
      setError(message)
      return false
    } finally {
      setIsRenaming(false)
    }
  }, [])

  return { renameFolder, isRenaming, error }
}

export function useUpdateDescription() {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const updateDescription = React.useCallback(async (folderName: string, newDescription: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/folders/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_name: folderName,
          description: newDescription
        })
      })

      if (!res.ok) throw new Error("Failed to update description")
      
      toast.success("Description updated")
      return true
    } catch (err) {
      console.error(err)
      toast.error("Could not save description")
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [])

  return { updateDescription, isUpdating }
}