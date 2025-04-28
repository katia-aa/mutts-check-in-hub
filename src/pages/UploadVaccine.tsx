
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import Confetti from "@/components/Confetti";
import UploadZone from "@/components/vaccine/UploadZone";
import UploadProgress from "@/components/vaccine/UploadProgress";
import FilePreview from "@/components/vaccine/FilePreview";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";
import { useCustomToast } from "@/hooks/use-custom-toast";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [showConfetti, setShowConfetti] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const handleUploadSuccess = () => {
    if (formSubmitted) return; // Prevent multiple success handlers
    
    setShowConfetti(true);
    toast.success({
      title: "Check-in complete!",
      description: "Your vaccination record has been uploaded successfully.",
      duration: 4000
    });
    
    // Redirect after a short delay to allow confetti to display
    setTimeout(() => {
      navigate("/");
    }, 4000);
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
      if (!showConfetti) { // Only reset if success didn't trigger
        setFormSubmitted(false);
      }
    }, 3000);
  };

  // Cleanup function to reset state if component unmounts during submission
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
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
    </>
  );
};

export default UploadVaccine;
