"use client"

import * as React from "react"
import { BACKEND_URL } from "@/lib/api"

export interface SegmentObject {
  id: number
  name: string
  className: string
  classId: number
  visible: boolean
}

export function useObjectRegistry(folder: string) {
  const [objects, setObjects] = React.useState<SegmentObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = React.useState<number | null>(null)
  const nextIdRef = React.useRef(0)

  const createObject = async (name: string, classId: number, className: string) => {
    const id = nextIdRef.current++

    await fetch(`${BACKEND_URL}/api/segmentation/create-object`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder,
        obj_id: id,
        class_id: classId,
      }),
    })

    setObjects(prev => [
      ...prev,
      {
        id,
        name,
        classId,
        className,
        visible: true,
      },
    ])

    setSelectedObjectId(id)
    return id
  }

  const deleteObject = async (id: number) => {
    await fetch(`${BACKEND_URL}/api/segmentation/delete-object`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder,
        obj_id: id,
      }),
    })

    setObjects(prev => prev.filter(o => o.id !== id))
    if (selectedObjectId === id) {
      setSelectedObjectId(null)
    }
  }

  const toggleVisibility = (id: number) => {
    setObjects(prev =>
      prev.map(o => (o.id === id ? { ...o, visible: !o.visible } : o))
    )
  }

  return {
    objects,
    selectedObjectId,
    createObject,
    deleteObject,
    selectObject: setSelectedObjectId,
    toggleVisibility,
  }
}
