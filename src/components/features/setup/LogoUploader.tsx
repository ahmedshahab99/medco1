"use client";

import { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LogoUploaderProps {
  onUpload: (url: string) => void;
  defaultImage?: string;
}

export function LogoUploader({ onUpload, defaultImage }: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size should be less than 2MB.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("clinic-assets")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicURLData } = supabase.storage
        .from("clinic-assets")
        .getPublicUrl(filePath);

      setPreviewURL(publicURLData.publicUrl);
      onUpload(publicURLData.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewURL(null);
    onUpload("");
  };

  return (
    <div className="w-full">
      {previewURL ? (
        <div className="relative w-32 h-32 rounded-lg border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center">
          <img
            src={previewURL}
            alt="Clinic Logo Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white hover:text-red-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition relative">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            )}
            <p className="text-xs text-slate-500 font-semibold p-2 text-center">
              {isUploading ? "جاري الرفع..." : "ارفع شعار العيادة"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
