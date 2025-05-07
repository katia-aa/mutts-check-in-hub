
import { useState } from "react";
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
  onSubmit
}: FileUploadFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <UploadZone
          onFileChange={onFileChange}
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
        
        <FileList 
          files={selectedFiles} 
          uploadingFileIndex={uploadingFileIndex}
        />
        
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
  );
};

export default FileUploadForm;
