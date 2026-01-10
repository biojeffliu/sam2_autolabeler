"use client"

import * as React from "react"
import { toFineTuneRequest } from "@/lib/finetune-adapter"
import type { FineTuneConfig, FineTuneResponse } from "@/lib/finetune-types"
import { BACKEND_URL } from "@/lib/api"

export function useFineTune() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const submit = React.useCallback(
    async (config: FineTuneConfig): Promise<FineTuneResponse> => {
      const req = toFineTuneRequest(config)
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${BACKEND_URL}/api/finetune`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Failed to start finetune job")
        }

        return (await res.json()) as FineTuneResponse
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error occured"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )
  return { submit, loading, error}

}