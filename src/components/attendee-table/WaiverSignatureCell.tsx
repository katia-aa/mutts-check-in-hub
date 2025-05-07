
import { AlertTriangle, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WaiverSignatureCellProps {
  signature: string | null | undefined;
}

const WaiverSignatureCell = ({ signature }: WaiverSignatureCellProps) => {
  if (!signature) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <AlertTriangle className="w-5 h-5" />
        <span>Not signed</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-gray-50 border rounded p-1">
              <div 
                dangerouslySetInnerHTML={{ __html: signature }} 
                className="max-w-[120px] max-h-[60px] min-h-[40px]" 
              />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Check className="w-4 h-4" />
              <span>Waiver signed</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Waiver signature</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WaiverSignatureCell;
