
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { configureStorage } from "@/utils/configureStorage";
import { attemptEdgeFunctionUpload } from "@/utils/uploadHelpers";
import { UseVaccineUploadProps, UploadState } from "@/types/vaccineUpload";

export const useVaccineUpload = ({ email, dogId, onUploadSuccess }: UseVaccineUploadProps) => {
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

  const clearFileSelection = () => {
    setState(prev => ({
      ...prev,
      file: null,
      preview: null,
      uploadProgress: null
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!state.file) {
      toast({
        variant: "destructive",
        title: "Oops! Missing vaccine record",
        description: "Please upload the vaccine record first",
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
      console.log("Submitting file for:", email);
      if (dogId) {
        console.log("For dog ID:", dogId);
      }
      
      console.log("File details:", {
        name: state.file.name,
        size: state.file.size,
        type: state.file.type
      });

      setState(prev => ({ ...prev, uploadProgress: 20 }));
      
      // Use edge function for upload
      let uploadResult = await attemptEdgeFunctionUpload(email, state.file, dogId);
      
      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${'error' in uploadResult ? uploadResult.error : 'Unknown error occurred'}`);
      }
      
      console.log("Upload successful:", uploadResult.data);
      setState(prev => ({ ...prev, uploadProgress: 100 }));

      toast({
        title: "Yay! You're all set! 🎉",
        description: dogId 
          ? "Your pet's vaccine record has been uploaded successfully!" 
          : "Can't wait to see you and your pup at the event!",
      });

      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading vaccine record:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "There was an error uploading the vaccine record. Please try again.",
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
    clearFileSelection,
  };
};
