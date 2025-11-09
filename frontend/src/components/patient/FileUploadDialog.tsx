

"use client";
import React, { FC, useState, useRef } from "react";
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
import { Upload, File, Image, Check, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProcessedData {
  documentId: string;
  filename: string;
  structuredData: any;
}

interface FileUploadDialogProps {
  onGraphCreated?: (graphId: string) => void;
}
const FileUploadDialog: FC<FileUploadDialogProps> = ({ onGraphCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({ text: '', type: 'info' });
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creatingGraph, setCreatingGraph] = useState(false);

  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({
        text: "Please upload only PDF or image files (JPEG, PNG, GIF, WebP)",
        type: 'error'
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage({
        text: "File size should be less than 10MB",
        type: 'error'
      });
      return false;
    }
    return true;
  };

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
    if (!selectedFile || !validateFile(selectedFile)) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: 'info' });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("token");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      type UploadResponse = {
        ok: boolean;
        data: ProcessedData;
        message?: string;
      };

      const response = await new Promise<UploadResponse>((resolve, reject) => {
        xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/patient/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.onload = () => {
          try {
            const parsed = JSON.parse(xhr.response);
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              data: parsed.data,
              message: parsed.message
            });
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });

      if (response.ok) {
        setMessage({ text: "✅ File processed successfully!", type: 'success' });
        setProcessedData(response.data);
        setShowUploadDialog(false);
        setShowDataDialog(true);
      } else {
        setMessage({ 
          text: response.message || "Upload failed", 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: "Error uploading file. Please try again.", 
        type: 'error' 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage({ text: '', type: 'info' });
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleShareData = async () => {
    if (!processedData?.structuredData) return;
    setCreatingGraph(true);
    setMessage({ text: '', type: 'info' });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/graph/saveGraph`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: JSON.stringify(processedData.structuredData) }),
        }
      );
      const result = await response.json();
      if (response.ok && result.data?.graphId) {
        setMessage({ 
          text: "✅ Knowledge graph created successfully!", 
          type: 'success' 
        });
        if (onGraphCreated) onGraphCreated(result.data.graphId);
        try {
          localStorage.setItem('graphId', result.data.graphId);
        } catch (e) {
          // ignore if localStorage not available
        }
      } else {
        setMessage({ 
          text: result.message || "Failed to create graph", 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: "Error creating graph. Please try again.", 
        type: 'error' 
      });
    } finally {
      setCreatingGraph(false);
    }
    setShowDataDialog(false);
    clearSelection();
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
            <div
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
                dragActive
                  ? "border-[#52b69a] bg-[#52b69a]/5"
                  : "border-gray-300 hover:border-[#52b69a]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleFileSelect({ target: { files: [file] } } as any);
                }
              }}
            >
              <Input
                id="file"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                ref={fileInputRef}
                accept=".pdf,image/*"
              />
              
              {!selectedFile ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Drag & Drop your files here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    or click to select files
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: PDF, JPEG, PNG, GIF, WebP
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {selectedFile.type.startsWith("image/") ? (
                    previewUrl && (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="rounded-lg object-contain max-h-32 mx-auto"
                        />
                      </div>
                    )
                  ) : (
                    <File className="w-12 h-12 text-[#52b69a]" />
                  )}
                  <p className="mt-4 font-medium text-gray-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#52b69a] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center mt-2 text-gray-600">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {message.text && (
              <div className={`rounded-lg p-3 text-sm ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700' 
                  : message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {message.text}
              </div>
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
              className="bg-[#52b69a] hover:bg-[#52b69a]/90"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            {/* Sanctioned Data Review Dialog */}
      {showDataDialog && processedData && (
        <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className="bg-[#52b69a]/10 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-[#52b69a]" />
                </div>
                <span>Review Extracted Data</span>
              </DialogTitle>
              <DialogDescription className="mt-4">
                We've processed your document and extracted the following healthcare information.
                Please review the data and decide if you'd like to contribute to our AI-driven
                healthcare knowledge graph.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <Card className="p-6 bg-gray-50/50 border-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-700">{processedData.filename}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Document ID: {processedData.documentId}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Extracted Health Information
                    </h4>
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      {renderStructuredData(processedData.structuredData)}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="flex items-center text-sm font-medium text-blue-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How We Use Your Data
                </h4>
                {/* <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Your data will be completely anonymized</li>
                  <li>• No personal information will be shared</li>
                  <li>• Helps improve healthcare insights for everyone</li>
                  <li>• You can delete your data at any time</li>
                </ul> */}
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0 mt-6">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Decline
              </Button>
              <Button
                onClick={handleShareData}
                className="gap-2 bg-[#52b69a] hover:bg-[#52b69a]/90"
                disabled={creatingGraph}
              >
                {creatingGraph ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating Graph...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Allow & Create Graph
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export { FileUploadDialog };
