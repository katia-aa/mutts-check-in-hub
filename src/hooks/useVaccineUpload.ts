
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { configureStorage } from "@/utils/configureStorage";

export interface UseVaccineUploadProps {
  email: string | null;
  onUploadSuccess: () => void;
}

export const useVaccineUpload = ({ email, onUploadSuccess }: UseVaccineUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [storageConfigured, setStorageConfigured] = useState(false);
  const [isConfiguringStorage, setIsConfiguringStorage] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 10MB",
      });
      return;
    }

    setFile(selectedFile);
    console.log("Selected file:", selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "Oops! Missing vaccine record",
        description: "Please upload your pup's vaccine record first",
      });
      return;
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const safeEmail = email.replace(/[^a-zA-Z0-9.@]/g, '_');
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${safeEmail}/${fileName}`;

      console.log("Submitting file:", file);
      console.log("Upload starting for file:", file.name);
      console.log("To path:", filePath);
      console.log("File size:", file.size, "bytes");
      console.log("File type:", file.type);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev !== null && prev < 30) {
            return prev + 5;
          }
          return prev;
        });
      }, 300);

      if (!storageConfigured) {
        console.log("Storage not pre-configured, configuring now...");
        setUploadProgress(10);
        const configResult = await configureStorage();
        
        console.log("Storage configuration check:", configResult);
        
        if (!configResult.success) {
          throw new Error("Failed to configure storage before upload");
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStorageConfigured(true);
      }
      
      setUploadProgress(40);

      const fileBlob = new Blob([file], { type: file.type });
      
      console.log("Creating signed URL for upload...");
      const { data: signedURL, error: signedError } = await supabase.storage
        .from('vaccine_records')
        .createSignedUploadUrl(filePath);
      
      if (signedError) {
        console.error("Error creating signed URL:", signedError);
        throw new Error(`Failed to create signed URL: ${signedError.message}`);
      }
      
      console.log("Got signed URL:", signedURL);
      setUploadProgress(60);
      
      const uploadResponse = await fetch(signedURL.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBlob,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`HTTP upload error: ${uploadResponse.status}`);
      }

      clearInterval(progressInterval);
      setUploadProgress(80);
      console.log("Upload successful using signed URL");

      const { data: { publicUrl } } = supabase.storage
        .from("vaccine_records")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
      setUploadProgress(90);

      const { error: updateError } = await supabase
        .from("attendees")
        .update({
          vaccine_upload_status: true,
          vaccine_file_path: filePath,
          vaccine_file_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setUploadProgress(100);
      console.log("Database updated successfully");

      toast({
        title: "Yay! You're all set! 🎉",
        description: "Can't wait to see you and your pup at the event!",
      });

      onUploadSuccess();
    } catch (error) {
      console.error("Error uploading vaccine record:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "There was an error uploading your vaccine record. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    preview,
    isUploading,
    uploadProgress,
    isConfiguringStorage,
    handleFileChange,
    handleSubmit,
  };
};
