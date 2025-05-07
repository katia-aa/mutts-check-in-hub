
import { useState, useEffect } from "react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { attemptEdgeFunctionUpload } from "@/utils/uploadHelpers";
import { UploadResult, UploadError } from "@/types/vaccineUpload";

interface UseMultiFileUploadProps {
  email: string | null;
  onUploadSuccess: () => void;
}

export const useMultiFileUpload = ({
  email,
  onUploadSuccess,
}: UseMultiFileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFileIndex, setUploadingFileIndex] = useState<number | null>(
    null
  );
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useCustomToast();

  const calculateOverallProgress = (
    currentFileIndex: number,
    currentProgress: number | null
  ) => {
    if (selectedFiles.length === 0) return 0;

    const fileContribution = 100 / selectedFiles.length;
    const completedFilesProgress = currentFileIndex * fileContribution;
    const currentFileProgress =
      (currentProgress || 0) * (fileContribution / 100);

    return Math.min(
      Math.round(completedFilesProgress + currentFileProgress),
      100
    );
  };

  // Update overall progress when individual file progress changes
  useEffect(() => {
    if (uploadingFileIndex !== null) {
      setOverallProgress(calculateOverallProgress(uploadingFileIndex, null));
    }
  }, [uploadingFileIndex, selectedFiles.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Check file sizes and validate
      const validFiles = newFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error({
            title: "File too large",
            description: `${file.name} is larger than 10MB. Please select a smaller file.`,
          });
          return false;
        }
        return true;
      });
      
      // Add new files to existing selection
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0 || formSubmitted) {
      return; // Prevent submission if no files or already submitted
    }

    setFormSubmitted(true);
    setUploadingFileIndex(0);

    try {
      // Upload all files using the edge function
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadingFileIndex(i);
        console.log(
          `Uploading file ${i + 1} of ${selectedFiles.length}: ${
            selectedFiles[i].name
          }`
        );

        if (email) {
          const result = await attemptEdgeFunctionUpload(
            email,
            selectedFiles[i]
          );

          if (!result.success) {
            throw new Error(`Failed to upload ${selectedFiles[i].name}: ${result.success === false ? result.error : 'Unknown error'}`);
          }

          console.log(
            `Successfully uploaded file ${i + 1}: ${selectedFiles[i].name}`
          );
        } else {
          throw new Error("Email is required for uploading files");
        }
      }

      console.log(`All ${selectedFiles.length} files uploaded successfully`);
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast.error({
        title: "Upload Error",
        description:
          error.message ||
          "There was an error uploading your vaccination records. Please try again.",
      });

      // Reset submission state to allow for retries
      setTimeout(() => {
        if (document.location.pathname !== "/check-in-complete") {
          setFormSubmitted(false);
          setUploadingFileIndex(null);
        }
      }, 3000);
    }
  };

  return {
    selectedFiles,
    uploadingFileIndex,
    overallProgress,
    formSubmitted,
    setSelectedFiles,
    handleFileChange,
    handleSubmit,
    handleRemoveFile
  };
};
