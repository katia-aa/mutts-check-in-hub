
import { CheckCircle, AlertTriangle } from "lucide-react";

interface StatusIndicatorProps {
  hasVaccineRecord: boolean;
}

const StatusIndicator = ({ hasVaccineRecord }: StatusIndicatorProps) => {
  if (hasVaccineRecord) {
    return (
      <>
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500 w-5 h-5" />
        </div>
        <div className="text-gray-600">Vaccine record uploaded</div>
      </>
    );
  }
  
  return (
    <>
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-500 w-5 h-5" />
      </div>
      <div className="text-gray-600">Missing vaccine record</div>
    </>
  );
};

export default StatusIndicator;
