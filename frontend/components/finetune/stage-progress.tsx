"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wifi, WifiOff, XCircle, ArrowDown } from "lucide-react"
// import { JobStatusBadge } from "./job-status-badge"
import type { FineTuneJob, TrainingMetrics, SSEEvent } from "@/lib/finetune-types"
import { useJobEvents } from "@/hooks/use-sse-events"

interface StageProgressProps {
  jobId: string
  onCancel: () => void
}

export function StageReview({
  jobId,
  onCancel,
}: StageProgressProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = React.useState(true)

  const { status, events, progress, metrics, connected } = useJobEvents(jobId)

  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, autoScroll])

  const currentEpoch = progress?.epoch ?? 0
  const totalEpochs = progress?.total ?? 0
  const epochProgress = totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0

  const currentLoop = progress?.loop ?? 0
  const totalLoops = progress?.total_loops ?? 0
  const loopProgress =
    totalLoops > 0 ? (currentLoop / totalLoops) * 100 : 0

  const latestMetrics =
    metrics.length > 0 ? metrics[metrics.length - 1] : null
}