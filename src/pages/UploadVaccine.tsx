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
  
  const handleUploadSuccess = () => {
    if (formSubmitted) return; // Prevent multiple success handlers
    
    toast.success({
      title: "Upload complete!",
      description: "Your vaccination records have been uploaded successfully.",
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
    
    try {
      // Upload first file using the original handler
      await originalHandleSubmit(e);
      
      // Upload additional files if any (skip the first file as it's already handled)
      if (selectedFiles.length > 1 && email) {
        for (let i = 1; i < selectedFiles.length; i++) {
          // Use the same edge function upload method for consistency
          await attemptEdgeFunctionUpload(email, selectedFiles[i]);
          console.log(`Uploaded additional file ${i+1} of ${selectedFiles.length}`);
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error({
        title: "Upload Error",
        description: "There was an error uploading your vaccination records. Please try again."
      });
      
      // Reset submission state to allow for retries
      setTimeout(() => {
        if (document.location.pathname !== "/check-in-complete") {
          setFormSubmitted(false);
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
          
          <UploadProgress progress={uploadProgress} />
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Selected Files:</h3>
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <FilePreview file={file} previewUrl={preview} />
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
