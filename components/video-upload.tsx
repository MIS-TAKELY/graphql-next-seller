"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
  className?: string
}

export function VideoUpload({ value = [], onChange, maxFiles = 5, className }: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newVideos: string[] = []
      const remainingSlots = maxFiles - value.length

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          if (file.type.startsWith("video/")) {
            const reader = new FileReader()
            reader.onload = (e) => {
              if (e.target?.result) {
                newVideos.push(e.target.result as string)
                if (newVideos.length === Math.min(files.length, remainingSlots)) {
                  onChange([...value, ...newVideos])
                }
              }
            }
            reader.readAsDataURL(file)
          }
        })
    },
    [value, onChange, maxFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeVideo = (index: number) => {
    const newVideos = value.filter((_, i) => i !== index)
    onChange(newVideos)
    if (playingVideo === index) {
      setPlayingVideo(null)
    }
  }

  const togglePlay = (index: number) => {
    setPlayingVideo(playingVideo === index ? null : index)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          value.length >= maxFiles && "opacity-50 pointer-events-none",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.multiple = true
              input.accept = "video/*"
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                handleFileSelect(target.files)
              }
              input.click()
            }}
            disabled={value.length >= maxFiles}
          >
            Choose Videos
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            MP4, MOV, AVI up to 100MB each. {value.length}/{maxFiles} uploaded.
          </p>
        </div>
      </Card>

      {/* Video Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {value.map((video, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  src={video || "/placeholder.svg"}
                  className="w-full h-full object-cover"
                  controls={playingVideo === index}
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => togglePlay(index)}
                  >
                    {playingVideo === index ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeVideo(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Video {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
