
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { configureStorage } from "@/utils/configureStorage";
import { attemptDirectUpload, attemptSignedUrlUpload, updateAttendeeRecord } from "@/utils/uploadHelpers";
import { UseVaccineUploadProps, UploadState } from "@/types/vaccineUpload";

export const useVaccineUpload = ({ email, onUploadSuccess }: UseVaccineUploadProps) => {
  const [state, setState] = useState<UploadState>({
    file: null,
    preview: null,
    isUploading: false,
    uploadProgress: null,
    isConfiguringStorage: false
  });
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

    setState(prev => ({ ...prev, file: selectedFile }));
    console.log("Selected file:", selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, preview: reader.result as string }));
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setState(prev => ({ ...prev, preview: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.file) {
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

    setState(prev => ({ 
      ...prev, 
      isUploading: true,
      uploadProgress: 0 
    }));

    try {
      const safeEmail = email.replace(/[^a-zA-Z0-9.@]/g, '_');
      const fileExt = state.file.name.split('.').pop() || '';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${safeEmail}/${fileName}`;

      console.log("Submitting file:", state.file);
      console.log("To path:", filePath);
      console.log("File size:", state.file.size, "bytes");
      console.log("File type:", state.file.type);

      setState(prev => ({ ...prev, uploadProgress: 10 }));
      
      let uploadResult = await attemptDirectUpload(filePath, state.file);
      
      if (!uploadResult.success) {
        setState(prev => ({ 
          ...prev, 
          isConfiguringStorage: true,
          uploadProgress: 20 
        }));
        
        console.log("Initial upload failed, configuring storage...");
        const configResult = await configureStorage();
        
        if (!configResult.success) {
          throw new Error(`Failed to configure storage: ${configResult.error?.message || "Unknown error"}`);
        }
        
        setState(prev => ({ ...prev, uploadProgress: 30 }));
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        console.log("Storage configured, retrying upload...");
        uploadResult = await attemptDirectUpload(filePath, state.file);
        
        if (!uploadResult.success) {
          console.log("Direct upload still failing, trying with signed URL...");
          uploadResult = await attemptSignedUrlUpload(filePath, state.file);
        }
        
        setState(prev => ({ ...prev, isConfiguringStorage: false }));
      }
      
      if (!uploadResult.success) {
        // Fixed here: Access error only on UploadError type
        throw new Error(`All upload methods failed: ${!uploadResult.success ? uploadResult.error : "Unknown error"}`);
      }
      
      console.log("Upload successful:", uploadResult.data);
      setState(prev => ({ ...prev, uploadProgress: 70 }));

      await updateAttendeeRecord(email, filePath);

      setState(prev => ({ ...prev, uploadProgress: 100 }));
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
      setState(prev => ({ 
        ...prev, 
        isUploading: false,
        isConfiguringStorage: false 
      }));
    }
  };

  return {
    file: state.file,
    preview: state.preview,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    isConfiguringStorage: state.isConfiguringStorage,
    handleFileChange,
    handleSubmit,
  };
};
