
import { useState, useEffect } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import UploadZone from "./vaccine/UploadZone";
import UploadProgress from "./vaccine/UploadProgress";
import FilePreview from "./vaccine/FilePreview";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";
import { useCustomToast } from "@/hooks/use-custom-toast";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  
  const handleUploadSuccess = () => {
    if (formSubmitted) return; // Prevent multiple success handlers
    
    toast.success({
      title: "Upload complete!",
      description: "Your vaccination record has been uploaded successfully.",
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
    handleFileChange,
    handleSubmit: originalHandleSubmit,
  } = useVaccineUpload({
    email,
    onUploadSuccess: handleUploadSuccess,
  });

  // Wrap the submit handler to prevent double submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUploading || isConfiguringStorage || !file || formSubmitted) {
      return; // Prevent submission if already in progress or form already submitted
    }
    
    setFormSubmitted(true); // Mark form as submitted
    await originalHandleSubmit(e);
    
    // If we get here without redirect, there was likely an error
    // Reset submission state after a delay to allow for retries
    setTimeout(() => {
      if (document.location.pathname !== "/check-in-complete") { // Only reset if we're not on the completion page
        setFormSubmitted(false);
      }
    }, 3000);
  };

  // Navigate to the multi-dog vaccine upload page
  const handleManageMultipleDogs = () => {
    navigate(`/dog-vaccine-upload?email=${encodeURIComponent(email || '')}`);
  };

  // Cleanup function to reset state if component unmounts during submission
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

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
          />
          
          <UploadProgress progress={uploadProgress} />
          
          <FilePreview file={file} previewUrl={preview} />
          
          {/* Add link for users with multiple dogs */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleManageMultipleDogs}
              className="text-mutts-primary hover:text-mutts-primary/80 p-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Bringing multiple dogs? Manage them here
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
          disabled={isUploading || isConfiguringStorage || !file || formSubmitted}
        >
          {isUploading ? "Uploading..." : (isConfiguringStorage ? "Preparing..." : formSubmitted ? "Processing..." : "Complete Check-In")}
          {!isUploading && !isConfiguringStorage && !formSubmitted && <ArrowRight className="ml-2" />}
        </Button>
      </form>
    </CheckInLayout>
  );
};

export default UploadVaccine;
