"use client"

import { useState } from "react"
import DatasetDirectory from "@/components/dataset-directory"
import ZipUploader from "@/components/upload-zip"

export default function DatasetPage(){
  return (
    <div className="mx-auto w-full p-6 space-y-8">
      <DatasetDirectory />
    </div>
  )
}