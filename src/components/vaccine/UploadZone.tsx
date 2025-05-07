
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UploadZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  isConfiguringStorage: boolean;
  multiple?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

const UploadZone = ({ 
  onFileChange, 
  isDisabled, 
  isConfiguringStorage, 
  multiple = false, 
  fileInputRef 
}: UploadZoneProps) => {
  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-mutts-primary/30 rounded-xl bg-white/70 hover:border-mutts-primary/50 transition-colors">
      <Upload className="h-8 w-8 mb-2 text-mutts-primary" />
      <Input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onFileChange}
        className="max-w-xs border-mutts-primary/30 focus-visible:ring-mutts-primary"
        disabled={isDisabled}
        multiple={multiple}
        ref={fileInputRef}
      />
      <p className="mt-2 text-sm text-gray-500">
        {multiple 
          ? "Select multiple files - one for each of your dogs" 
          : "Select a file for your pup"}
        <br />
        Accepts JPG, PNG, or PDF (max 10MB each)
      </p>
      {isConfiguringStorage && (
        <p className="mt-1 text-xs text-blue-600 animate-pulse">
          Setting up secure storage...
        </p>
      )}
    </div>
  );
};

export default UploadZone;
