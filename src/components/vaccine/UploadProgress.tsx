
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number | null;
}

const UploadProgress = ({ progress }: UploadProgressProps) => {
  if (progress === null) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-mutts-primary h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default UploadProgress;
