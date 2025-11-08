"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, File, Image } from "lucide-react";
import axios from "axios"

export function FileUploadDialog() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
    if (file) {
      setSelectedFile(file);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/upload` ,{
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("File uploaded and processed successfully!");
        console.log("Structured data:", result.data);
        clearSelection();
      } else {
        setMessage(`${result.message || "Upload failed"}`);
      }
    } catch (err) {
      setMessage("Error uploading file.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full">
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
          <Input
            id="file"
            type="file"
            className="col-span-4"
            onChange={handleFileSelect}
            ref={fileInputRef}
            accept=".pdf,image/*"
          />

          {selectedFile && (
            <div className="flex items-center gap-2 text-sm">
              {selectedFile.type.startsWith("image/") ? (
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
                style={{ maxHeight: "200px", width: "auto", margin: "0 auto" }}
              />
            </div>
          )}

          {message && (
            <p className="text-sm text-center mt-2">{message}</p>
          )}
        </div>

        <DialogFooter>
          {selectedFile && (
            <Button
              variant="outline"
              onClick={clearSelection}
              className="mr-2"
              disabled={uploading}
            >
              Clear
            </Button>
          )}
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
