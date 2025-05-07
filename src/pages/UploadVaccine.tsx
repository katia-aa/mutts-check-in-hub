
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import UploadZone from "@/components/vaccine/UploadZone";
import UploadProgress from "@/components/vaccine/UploadProgress";
import FilePreview from "@/components/vaccine/FilePreview";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { attemptEdgeFunctionUpload } from "@/utils/uploadHelpers";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFileIndex, setUploadingFileIndex] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  
  const calculateOverallProgress = (currentFileIndex: number, currentProgress: number | null) => {
    if (selectedFiles.length === 0) return 0;
    
    const fileContribution = 100 / selectedFiles.length;
    const completedFilesProgress = currentFileIndex * fileContribution;
    const currentFileProgress = (currentProgress || 0) * (fileContribution / 100);
    
    return Math.min(Math.round(completedFilesProgress + currentFileProgress), 100);
  };
  
  const handleUploadSuccess = () => {
    if (formSubmitted) return; // Prevent multiple success handlers
    
    toast.success({
      title: "Upload complete!",
      description: `${selectedFiles.length > 1 
        ? `All ${selectedFiles.length} vaccination records have` 
        : "Your vaccination record has"} been uploaded successfully.`,
      duration: 2000
    });
    
    // Redirect to the completion screen
    setTimeout(() => {
      navigate("/check-in-complete");
    }, 1000);
  };

  const {
    file,
    preview,
    isUploading,
    uploadProgress,
    isConfiguringStorage,
    handleFileChange: singleFileChange,
    handleSubmit: originalHandleSubmit,
  } = useVaccineUpload({
    email,
    onUploadSuccess: handleUploadSuccess,
  });

  // Update overall progress when individual file progress changes
  useEffect(() => {
    if (uploadingFileIndex !== null) {
      setOverallProgress(calculateOverallProgress(uploadingFileIndex, uploadProgress));
    }
  }, [uploadProgress, uploadingFileIndex]);

  // Handle multiple file selections
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Check file sizes
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error({
            title: "File too large",
            description: `${file.name} is larger than 10MB. Please select a smaller file.`
          });
          return false;
        }
        return true;
      });
      
      setSelectedFiles(validFiles);
      
      // Still use the original handler for the first file to maintain compatibility
      if (validFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(validFiles[0]);
        
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            files: dataTransfer.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        singleFileChange(newEvent);
      }
    }
  };

  // Wrap the submit handler to prevent double submissions and handle multiple files
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUploading || isConfiguringStorage || selectedFiles.length === 0 || formSubmitted) {
      return; // Prevent submission if already in progress or form already submitted
    }
    
    setFormSubmitted(true); // Mark form as submitted
    setUploadingFileIndex(0);
    
    try {
      // Upload all files using the edge function
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadingFileIndex(i);
        console.log(`Uploading file ${i+1} of ${selectedFiles.length}: ${selectedFiles[i].name}`);
        
        if (email) {
          const result = await attemptEdgeFunctionUpload(email, selectedFiles[i]);
          
          if (!result.success) {
            throw new Error(`Failed to upload ${selectedFiles[i].name}: ${result.error}`);
          }
          
          console.log(`Successfully uploaded file ${i+1}: ${selectedFiles[i].name}`);
        } else {
          throw new Error("Email is required for uploading files");
        }
      }
      
      console.log(`All ${selectedFiles.length} files uploaded successfully`);
      handleUploadSuccess();
      
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast.error({
        title: "Upload Error",
        description: error.message || "There was an error uploading your vaccination records. Please try again."
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

  return (
    <CheckInLayout
      step={3}
      title="Last Step!"
      subtitle="Upload your pup's vaccine record and you're good to go"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <UploadZone
            onFileChange={handleFileChange}
            isDisabled={isUploading || isConfiguringStorage || formSubmitted}
            isConfiguringStorage={isConfiguringStorage}
            multiple={true}
          />
          
          {(isUploading || formSubmitted) && (
            <>
              <UploadProgress progress={overallProgress} />
              {uploadingFileIndex !== null && selectedFiles.length > 1 && (
                <p className="text-xs text-center text-gray-500">
                  Uploading file {uploadingFileIndex + 1} of {selectedFiles.length}...
                </p>
              )}
            </>
          )}
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Selected Files:</h3>
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`} 
                  className={`flex items-center justify-between p-2 rounded-md ${
                    uploadingFileIndex === index ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {preview && (
            <FilePreview file={file} previewUrl={preview} />
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
          disabled={isUploading || isConfiguringStorage || selectedFiles.length === 0 || formSubmitted}
        >
          {isUploading ? "Uploading..." : (isConfiguringStorage ? "Preparing..." : formSubmitted ? "Processing..." : "Complete Check-In")}
          {!isUploading && !isConfiguringStorage && !formSubmitted && <ArrowRight className="ml-2" />}
        </Button>
      </form>
    </CheckInLayout>
  );
};

export default UploadVaccine;
