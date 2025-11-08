"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Upload, File, Image } from 'lucide-react'

export function FileUploadDialog() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleUpload = () => {
    // This is where you would implement the actual upload logic
    console.log('File selected for upload:', selectedFile)
    // Reset after "upload"
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload your medical documents, reports, or images here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="file"
              type="file"
              className="col-span-4"
              onChange={handleFileSelect}
              ref={fileInputRef}
              accept=".pdf,image/*"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm">
              {selectedFile.type.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
              <span>{selectedFile.name}</span>
            </div>
          )}
          {previewUrl && (
            <div className="relative aspect-video w-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-md object-contain"
                style={{ maxHeight: '200px', width: 'auto', margin: '0 auto' }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          {selectedFile && (
            <Button variant="outline" onClick={clearSelection} className="mr-2">
              Clear
            </Button>
          )}
          <Button type="submit" onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}