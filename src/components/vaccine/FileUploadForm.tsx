import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "./UploadZone";
import UploadProgress from "./UploadProgress";
import FilePreview from "./FilePreview";
import FileList from "./FileList";

interface FileUploadFormProps {
  isUploading: boolean;
  isConfiguringStorage: boolean;
  formSubmitted: boolean;
  selectedFiles: File[];
  file: File | null;
  preview: string | null;
  overallProgress: number;
  uploadingFileIndex: number | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveFile: (index: number) => void;
  allowMultiple?: boolean;
  isLoadingDogs?: boolean;
  dogCount?: number;
}

const FileUploadForm = ({
  isUploading,
  isConfiguringStorage,
  formSubmitted,
  selectedFiles,
  file,
  preview,
  overallProgress,
  uploadingFileIndex,
  onFileChange,
  onSubmit,
  onRemoveFile,
  allowMultiple = false,
  isLoadingDogs = false,
  dogCount = 0
}: FileUploadFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    // Reset the file input after handling the change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDisabled = isUploading || isConfiguringStorage || formSubmitted || isLoadingDogs;
  const noFilesSelected = selectedFiles.length === 0;
  const hasRequiredFiles = dogCount === 0 || selectedFiles.length >= dogCount;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <UploadZone
          onFileChange={handleFileChange}
          isDisabled={isDisabled}
          isConfiguringStorage={isConfiguringStorage}
          multiple={allowMultiple}
          fileInputRef={fileInputRef}
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
          <FileList 
            files={selectedFiles} 
            uploadingFileIndex={uploadingFileIndex}
            onRemoveFile={onRemoveFile}
          />
        )}
        
        {preview && (
          <FilePreview file={file} previewUrl={preview} />
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
        disabled={isDisabled || noFilesSelected || !hasRequiredFiles}
      >
        {isLoadingDogs ? "Loading your pet info..." : (
          isUploading ? `Uploading ${uploadingFileIndex !== null ? `(${uploadingFileIndex + 1}/${selectedFiles.length})` : '...'}` : (
            isConfiguringStorage ? "Preparing..." : (
              formSubmitted ? "Processing..." : "Complete Check-In"
            )
          )
        )}
        {!isUploading && !isConfiguringStorage && !formSubmitted && !isLoadingDogs && <ArrowRight className="ml-2" />}
      </Button>

      {dogCount > 0 && !hasRequiredFiles && !isLoadingDogs && (
        <p className="text-sm text-center text-red-500">
          Please upload vaccine records for all {dogCount} dog{dogCount > 1 ? "s" : ""}
        </p>
      )}
    </form>
  );
};

export default FileUploadForm;
