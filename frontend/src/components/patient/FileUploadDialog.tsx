<<<<<<< HEAD
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
import { Upload, File, Image, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProcessedData {
  documentId: string;
  filename: string;
  structuredData: any;
}

export function FileUploadDialog() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patient/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        setMessage("File processed successfully!");
        setProcessedData(result.data);
        setShowUploadDialog(false);
        setShowDataDialog(true); 
      } else {
        setMessage(`${result.message || "Upload failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleShareData = async () => {
    // if (!processedData?.documentId) return;

    // try {
    //   const token = localStorage.getItem("token");
    //   const response = await fetch(
    //     `${process.env.NEXT_PUBLIC_API_URL}/patient/documents/${processedData.documentId}/share`,
    //     {
    //       method: "POST",
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   if (response.ok) {
    //     setMessage("✅Data shared successfully to create your knowledge graph!");
    //   } else {
    //     const error = await response.json();
    //     setMessage(` Failed to share data: ${error.message}`);
    //   }
    // } catch (err) {
    //   console.error(err);
    //   setMessage("Error sharing data.");
    // }

    // setShowDataDialog(false);
    // clearSelection();
  };

  const handleDecline = () => {
    setShowDataDialog(false);
    clearSelection();
  };

  // helper to show structured data neatly
  const renderStructuredData = (data: any) => {
    if (!data) return <p className="text-sm text-gray-500">No structured data extracted.</p>;

    if (typeof data === "object") {
      return (
        <div className="space-y-1 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <p key={key}>
              <strong className="capitalize">{key.replace(/_/g, " ")}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            </p>
          ))}
        </div>
      );
    }

    return <p>{String(data)}</p>;
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowUploadDialog(true)}
          >
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
                  style={{
                    maxHeight: "200px",
                    width: "auto",
                    margin: "0 auto",
                  }}
                />
              </div>
            )}

            {message && <p className="text-sm text-center mt-2">{message}</p>}
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

      {/* Sanctioned Data Review Dialog */}
      {showDataDialog && processedData && (
        <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Review Processed Document</DialogTitle>
              <DialogDescription>
                We’ve extracted the following sanctioned data from your uploaded
                file. Please review and confirm if we can use it to build your
                personalized healthcare knowledge graph.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <Card className="p-4 bg-gray-50">
                <div className="space-y-2 text-sm">
                  <p><strong>📄 File Name:</strong> {processedData.filename}</p>
                  <p><strong>🆔 Document ID:</strong> {processedData.documentId}</p>

                  <div className="mt-3 rounded-md bg-white p-3 border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Sanctioned Data:</p>
                    {renderStructuredData(processedData.structuredData)}
                  </div>
                </div>
              </Card>

              <p className="text-sm text-gray-600">
                Your data will be anonymized and securely used to enhance our
                AI-driven healthcare knowledge graph. No personal details will be
                exposed or linked back to you.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={handleDecline} className="gap-2">
                <X className="w-4 h-4" />
                Decline
              </Button>
              <Button onClick={handleShareData} className="gap-2">
                <Check className="w-4 h-4" />
                Allow & Create Graph
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
=======
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
>>>>>>> 8485be2ae083102b8c316a38610bafe7e3f26eef
