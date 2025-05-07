
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

  // Handle base64 SVG data
  const isSvgData = signature.startsWith('data:image/svg+xml;base64,') || 
                    signature.startsWith('<svg');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-gray-50 border rounded p-1">
              {isSvgData ? (
                <div className="max-w-[120px] max-h-[60px] min-h-[40px]">
                  {signature.startsWith('data:image/svg+xml;base64,') ? (
                    <img 
                      src={signature} 
                      alt="Signed waiver" 
                      className="max-h-[60px]" 
                    />
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ __html: signature }} 
                      className="max-w-[120px] max-h-[60px]" 
                    />
                  )}
                </div>
              ) : (
                <div className="max-w-[120px] max-h-[60px] min-h-[40px] flex items-center justify-center text-xs text-gray-500">
                  Signature available
                </div>
              )}
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
