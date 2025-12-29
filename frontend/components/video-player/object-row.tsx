"use client"

import { Eye, EyeOff, Trash2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getClassColor } from "@/lib/cocos-classes"
import { useObjectMaskCount } from "@/hooks/use-sam2"
import { SegmentObject } from "@/hooks/use-object-registry"

interface ObjectRowProps {
  folder: string
  obj: SegmentObject
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleVisibility: () => void
  registerRefetch: (fn: () => void) => void
  unregisterRefetch: (fn: () => void) => void
}

export function ObjectRow({
  folder,
  obj,
  selected,
  onSelect,
  onDelete,
  onToggleVisibility,
  registerRefetch,
  unregisterRefetch
}: ObjectRowProps) {
  const { count, loading, refetch } = useObjectMaskCount(folder, obj.id)

  React.useEffect(() => {
    registerRefetch(refetch)
    return () => unregisterRefetch(refetch)
  }, [refetch, registerRefetch, unregisterRefetch])

  return (
    <div
      className={`p-2 rounded-md border cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: getClassColor(obj.className) }}
          />
          <span className="text-sm font-medium truncate">{obj.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
          >
            {obj.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Badge variant="secondary" className="text-xs">
          {obj.className}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {loading ? "…" : `${count} masks`}
        </span>
      </div>
    </div>
  )
}