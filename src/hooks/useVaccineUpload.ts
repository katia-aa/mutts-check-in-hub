
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { configureStorage } from "@/utils/configureStorage";

export interface UseVaccineUploadProps {
  email: string | null;
  onUploadSuccess: () => void;
}

// Define proper return types for clarity
interface UploadSuccess {
  success: true;
  data: {
    id: string;
    path: string;
    fullPath: string;
  };
}

interface UploadError {
  success: false;
  error: any;
}

type UploadResult = UploadSuccess | UploadError;

export const useVaccineUpload = ({ email, onUploadSuccess }: UseVaccineUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
      console.log("To path:", filePath);
      console.log("File size:", file.size, "bytes");
      console.log("File type:", file.type);

      setUploadProgress(10);
      
      // Try direct upload first
      let uploadResult = await attemptDirectUpload(filePath, file);
      
      // If direct upload failed, try configuration and retry
      if (!uploadResult.success) {
        setIsConfiguringStorage(true);
        setUploadProgress(20);
        
        console.log("Initial upload failed, configuring storage...");
        const configResult = await configureStorage();
        
        if (!configResult.success) {
          throw new Error(`Failed to configure storage: ${configResult.error?.message || "Unknown error"}`);
        }
        
        setUploadProgress(30);
        // Wait longer for storage configuration to propagate
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        console.log("Storage configured, retrying upload...");
        uploadResult = await attemptDirectUpload(filePath, file);
        
        // If still failing, try with signed URL
        if (!uploadResult.success) {
          console.log("Direct upload still failing, trying with signed URL...");
          uploadResult = await attemptSignedUrlUpload(filePath, file);
        }
        
        setIsConfiguringStorage(false);
      }
      
      if (!uploadResult.success) {
        throw new Error(`All upload methods failed: ${uploadResult.error}`);
      }
      
      console.log("Upload successful:", uploadResult.data);
      setUploadProgress(70);

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
    } catch (error: any) {
      console.error("Error uploading vaccine record:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "There was an error uploading your vaccine record. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setIsConfiguringStorage(false);
    }
  };
  
  // Helper function for direct upload - updated return type to match expected format
  const attemptDirectUpload = async (filePath: string, file: File): Promise<UploadResult> => {
    try {
      const { data, error } = await supabase.storage
        .from('vaccine_records')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
        
      if (error) {
        console.error("Direct upload failed:", error);
        return { success: false, error: error.message };
      }
      
      // Fix: Match the expected return type structure
      return { 
        success: true, 
        data: {
          id: data?.id || filePath, // Use filePath as id if not available
          path: data?.path || filePath,
          fullPath: filePath
        }
      };
    } catch (uploadError: any) {
      console.error("Exception during direct upload:", uploadError);
      return { success: false, error: uploadError.message || String(uploadError) };
    }
  };
  
  // Helper function for signed URL upload - updated return type to match expected format
  const attemptSignedUrlUpload = async (filePath: string, file: File): Promise<UploadResult> => {
    try {
      setUploadProgress(40);
      
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('vaccine_records')
        .createSignedUploadUrl(filePath);
        
      if (signedUrlError) {
        console.error("Signed URL creation failed:", signedUrlError);
        return { success: false, error: signedUrlError.message };
      }
      
      // Use the correct property name 'signedUrl' (not signedURL)
      const { signedUrl, token } = signedUrlData;
      
      setUploadProgress(50);
      
      // Upload directly to the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      });
      
      if (!uploadResponse.ok) {
        console.error("Signed URL upload failed:", uploadResponse.statusText);
        return { success: false, error: `HTTP error: ${uploadResponse.status} ${uploadResponse.statusText}` };
      }
      
      console.log("Signed URL upload successful");
      // Fix: Match the expected return type structure
      return { 
        success: true, 
        data: {
          id: token || filePath,  // Use token as id, fallback to filePath
          path: filePath,
          fullPath: filePath
        }
      };
    } catch (signedUrlError: any) {
      console.error("Exception during signed URL upload:", signedUrlError);
      return { success: false, error: signedUrlError.message || String(signedUrlError) };
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
