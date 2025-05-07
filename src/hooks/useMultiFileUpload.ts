
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { attemptEdgeFunctionUpload } from "@/utils/uploadHelpers";
import { UploadResult } from "@/types/vaccineUpload";

interface MultiFileUploadProps {
  email: string | null;
  onUploadSuccess: () => void;
}

export const useMultiFileUpload = ({
  email,
  onUploadSuccess
}: MultiFileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFileIndex, setUploadingFileIndex] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Check file sizes
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `${file.name} is larger than 10MB. Please select a smaller file.`
          });
          return false;
        }
        return true;
      });
      
      // Add new files to the existing selection
      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0 || !email || formSubmitted) {
      toast({
        variant: "destructive",
        title: "Unable to proceed",
        description: selectedFiles.length === 0 
          ? "Please select files to upload" 
          : "Missing email or already uploading"
      });
      return;
    }
    
    setFormSubmitted(true);
    
    try {
      // Upload each file sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadingFileIndex(i);
        setOverallProgress((i / selectedFiles.length) * 100);
        
        const file = selectedFiles[i];
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        const result = await attemptEdgeFunctionUpload(email, file);
        
        if (!result.success && "error" in result) {
          const errorMessage = "Unknown error occurred";
          throw new Error(`Error uploading ${file.name}: ${errorMessage}`);
        }
        
        console.log(`Successfully uploaded ${file.name}`);
      }
      
      setOverallProgress(100);
      
      toast({
        title: "Files uploaded successfully",
        description: `All ${selectedFiles.length} files have been uploaded.`,
      });
      
      // Call the success callback
      onUploadSuccess();
      
    } catch (error: any) {
      console.error("Error during file uploads:", error);
      
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "There was an error uploading your files."
      });
      
      // Reset submitted state to allow retries
      setFormSubmitted(false);
    }
  };

  return {
    selectedFiles,
    uploadingFileIndex,
    overallProgress,
    formSubmitted,
    handleFileChange,
    handleSubmit,
    handleRemoveFile
  };
};
