
import { CheckCircle, AlertTriangle } from "lucide-react";

interface StatusIndicatorProps {
  hasVaccineRecord: boolean;
  hasWaiverSignature: boolean;
}

const StatusIndicator = ({ hasVaccineRecord, hasWaiverSignature }: StatusIndicatorProps) => {
  // Both requirements are met
  if (hasVaccineRecord && hasWaiverSignature) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500 w-5 h-5" />
          <span className="text-green-700 font-medium">Ready</span>
        </div>
      </div>
    );
  }
  
  // At least one requirement is missing
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-500 w-5 h-5" />
        <span className="text-amber-700 font-medium">Incomplete</span>
      </div>
      <div className="text-xs text-gray-600">
        {!hasVaccineRecord && !hasWaiverSignature 
          ? "Missing vaccine & waiver" 
          : !hasVaccineRecord 
            ? "Missing vaccine" 
            : "Missing waiver"}
      </div>
    </div>
  );
};

export default StatusIndicator;
