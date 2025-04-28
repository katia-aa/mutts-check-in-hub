
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UploadZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  isConfiguringStorage: boolean;
}

const UploadZone = ({ onFileChange, isDisabled, isConfiguringStorage }: UploadZoneProps) => {
  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-mutts-primary/30 rounded-xl bg-white/70 hover:border-mutts-primary/50 transition-colors">
      <Upload className="h-8 w-8 mb-2 text-mutts-primary" />
      <Input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onFileChange}
        className="max-w-xs border-mutts-primary/30 focus-visible:ring-mutts-primary"
        disabled={isDisabled}
      />
      <p className="mt-2 text-sm text-gray-500">
        Accepts JPG, PNG, or PDF (max 10MB)
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
