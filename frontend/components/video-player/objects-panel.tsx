"use client"

import * as React from "react"
import { Plus, Trash2, Eye, EyeOff, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ObjectRow } from "@/components/video-player/object-row"
import { COCO_CLASSES, CocoClass, getClassColor } from "@/lib/cocos-classes"
import { SegmentObject } from "@/hooks/use-object-registry"

interface ObjectsPanelProps {
  folder: string
  objects: SegmentObject[]
  selectedObjectId: number | null
  onSelectObject: (id: number | null) => void
  onCreateObject: (name: string, className: CocoClass) => void
  onDeleteObject: (id: number) => void
  onToggleVisibility: (id: number) => void
  registerRefetch: (fn: () => void) => void
  unregisterRefetch: (fn: () => void) => void
}

export function ObjectsPanel({
  folder,
  objects,
  selectedObjectId,
  onSelectObject,
  onCreateObject,
  onDeleteObject,
  onToggleVisibility,
  registerRefetch,
  unregisterRefetch
}: ObjectsPanelProps) {
  const [newObjectName, setNewObjectName] = React.useState("")
  const [newObjectClass, setNewObjectClass] = React.useState<CocoClass | "">("")

  const handleCreate = () => {
    if (newObjectName.trim() && newObjectClass) {
      onCreateObject(newObjectName.trim(), newObjectClass)
      setNewObjectName("")
      setNewObjectClass("")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Objects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new object */}
        <div className="space-y-2">
          <Input
            placeholder="Object name"
            value={newObjectName}
            onChange={(e) => setNewObjectName(e.target.value)}
            className="h-8 text-sm"
          />
          <Select value={newObjectClass} onValueChange={(value) => setNewObjectClass(value as CocoClass)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {COCO_CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getClassColor(cls) }} />
                    {cls}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="w-full"
            onClick={handleCreate}
            disabled={!newObjectName.trim() || !newObjectClass}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Object
          </Button>
        </div>

        {/* Objects list */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {objects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No objects created</p>
            ) : (
              objects.map((obj) => (
                <ObjectRow
                  key={obj.id}
                  folder={folder}
                  obj={obj}
                  selected={selectedObjectId === obj.id}
                  onSelect={() => onSelectObject(selectedObjectId === obj.id ? null : obj.id)}
                  onDelete={() => onDeleteObject(obj.id)}
                  onToggleVisibility={() => onToggleVisibility(obj.id)}
                  registerRefetch={registerRefetch}
                  unregisterRefetch={unregisterRefetch}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}