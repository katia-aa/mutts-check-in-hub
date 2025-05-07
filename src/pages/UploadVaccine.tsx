import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CheckInLayout from "@/components/CheckInLayout";
import FileUploadForm from "@/components/vaccine/FileUploadForm";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useDogManagement } from "@/hooks/useDogManagement";
import { useMultiFileUpload } from "@/hooks/useMultiFileUpload";

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

  // Initialize the multi file upload hook
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
    
  // Get dog count for clear messaging
  const dogCount = dogs?.length || 0;

  return (
    <CheckInLayout
      step={3}
      title="Last Step!"
      subtitle={subtitle}
    >
      <FileUploadForm
        isUploading={uploadingFileIndex !== null}
        isConfiguringStorage={false}
        formSubmitted={formSubmitted}
        selectedFiles={selectedFiles}
        file={selectedFiles[0] || null}
        preview={null}
        overallProgress={overallProgress}
        uploadingFileIndex={uploadingFileIndex}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onRemoveFile={handleRemoveFile}
        allowMultiple={true}
        isLoadingDogs={isLoadingDogs}
        dogCount={dogCount}
      />

      {dogCount > 0 && !formSubmitted && !isLoadingDogs && (
        <div className="mt-4 text-sm text-center text-gray-600">
          {dogCount === 1 ? (
            <p>You have 1 dog registered for this event</p>
          ) : (
            <p>You have {dogCount} dogs registered for this event</p>
          )}
        </div>
      )}
    </CheckInLayout>
  );
};

export default UploadVaccine;
