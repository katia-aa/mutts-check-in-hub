
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import Confetti from "@/components/Confetti";
import UploadZone from "@/components/vaccine/UploadZone";
import UploadProgress from "@/components/vaccine/UploadProgress";
import FilePreview from "@/components/vaccine/FilePreview";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setShowConfetti(true);
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
    handleSubmit,
  } = useVaccineUpload({
    email,
    onUploadSuccess: handleUploadSuccess,
  });

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
              isDisabled={isUploading}
              isConfiguringStorage={isConfiguringStorage}
            />
            
            <UploadProgress progress={uploadProgress} />
            
            <FilePreview file={file} previewUrl={preview} />
          </div>

          <Button
            type="submit"
            className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
            disabled={isUploading || isConfiguringStorage || !file}
          >
            {isUploading ? "Uploading..." : (isConfiguringStorage ? "Preparing..." : "Complete Check-In")}
            {!isUploading && !isConfiguringStorage && <ArrowRight className="ml-2" />}
          </Button>
        </form>
      </CheckInLayout>
    </>
  );
};

export default UploadVaccine;
