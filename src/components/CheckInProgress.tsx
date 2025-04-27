
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface CheckInProgressProps {
  step: 1 | 2 | 3; // 1: Email, 2: Waiver, 3: Vaccine upload
}

const CheckInProgress = ({ step }: CheckInProgressProps) => {
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  
  const getMessage = () => {
    switch(step) {
      case 1:
        return "Let's get started!";
      case 2:
        return "Almost there!";
      case 3:
        return "Final step!";
      default:
        return "";
    }
  };

  return (
    <div className="mb-8 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-mutts-primary">{getMessage()}</p>
        <Badge className="bg-mutts-primary/20 text-mutts-primary border-none px-2 py-1">
          Step {step} of 3
        </Badge>
      </div>
      <Progress value={progress} className="h-2.5 bg-mutts-primary/20" />
      
      <div className="flex justify-between mt-1">
        <div className="flex items-center space-x-1 text-xs font-medium">
          <div className={`rounded-full ${step >= 1 ? 'bg-mutts-primary text-white' : 'bg-gray-200'} h-5 w-5 flex items-center justify-center`}>
            {step > 1 ? <CheckCircle className="h-3 w-3" /> : '1'}
          </div>
          <span className={step >= 1 ? 'text-mutts-primary' : 'text-gray-400'}>Email</span>
        </div>
        <div className="flex items-center space-x-1 text-xs font-medium">
          <div className={`rounded-full ${step >= 2 ? 'bg-mutts-primary text-white' : 'bg-gray-200'} h-5 w-5 flex items-center justify-center`}>
            {step > 2 ? <CheckCircle className="h-3 w-3" /> : '2'}
          </div>
          <span className={step >= 2 ? 'text-mutts-primary' : 'text-gray-400'}>Waiver</span>
        </div>
        <div className="flex items-center space-x-1 text-xs font-medium">
          <div className={`rounded-full ${step >= 3 ? 'bg-mutts-primary text-white' : 'bg-gray-200'} h-5 w-5 flex items-center justify-center`}>
            3
          </div>
          <span className={step >= 3 ? 'text-mutts-primary' : 'text-gray-400'}>Vaccine</span>
        </div>
      </div>
    </div>
  );
};

export default CheckInProgress;
