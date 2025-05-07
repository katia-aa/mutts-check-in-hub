
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CheckInLayout from "@/components/CheckInLayout";
import FileUploadForm from "@/components/vaccine/FileUploadForm";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";
import { useMultiFileUpload } from "@/hooks/useMultiFileUpload";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useDogManagement } from "@/hooks/useDogManagement";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const [hasMultipleDogs, setHasMultipleDogs] = useState(false);
  
  // Fetch dogs for this user
  const { dogs, fetchDogs, isLoading: isLoadingDogs } = useDogManagement(email);
  
  useEffect(() => {
    if (email) {
      fetchDogs();
    }
  }, [email]);
  
  // Update the multiple dogs state when dogs data is loaded
  useEffect(() => {
    if (dogs && dogs.length > 1) {
      setHasMultipleDogs(true);
    } else {
      setHasMultipleDogs(false);
    }
  }, [dogs]);
  
  const handleUploadSuccess = () => {
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
  } = useVaccineUpload({
    email,
    onUploadSuccess: handleUploadSuccess,
  });

  const {
    selectedFiles,
    uploadingFileIndex,
    overallProgress,
    formSubmitted,
    handleFileChange,
    handleSubmit,
    handleRemoveFile
  } = useMultiFileUpload({
    email,
    onUploadSuccess: handleUploadSuccess
  });

  // Determine subtitle based on dog count
  const subtitle = hasMultipleDogs 
    ? "Upload your pups' vaccine records. Please upload one for each dog you're bringing." 
    : "Upload your pup's vaccine record and you're good to go";

  return (
    <CheckInLayout
      step={3}
      title="Last Step!"
      subtitle={subtitle}
    >
      <FileUploadForm
        isUploading={isUploading}
        isConfiguringStorage={isConfiguringStorage}
        formSubmitted={formSubmitted}
        selectedFiles={selectedFiles}
        file={file}
        preview={preview}
        overallProgress={overallProgress}
        uploadingFileIndex={uploadingFileIndex}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onRemoveFile={handleRemoveFile}
        allowMultiple={hasMultipleDogs}
        isLoadingDogs={isLoadingDogs}
      />
    </CheckInLayout>
  );
};

export default UploadVaccine;
