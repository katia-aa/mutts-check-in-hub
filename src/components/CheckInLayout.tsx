
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import CheckInProgress from "@/components/CheckInProgress";

interface CheckInLayoutProps {
  children: ReactNode;
  step?: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  showProgress?: boolean;
}

const CheckInLayout = ({ 
  children, 
  step = 1, 
  title, 
  subtitle,
  showProgress = true 
}: CheckInLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-gradient px-4 py-12 font-['Inter']">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <img 
            src="https://muttsinthe6ix.ca/assets/images/image01.png?v=e2c919dc" 
            alt="Mutts in the 6ix" 
            className="h-24 mx-auto animate-scale-up mb-6"
          />
        </div>
        
        <Card className="w-full border-none card-shadow rounded-xl bg-white/90 backdrop-blur-sm">
          {showProgress && <div className="px-6 pt-6"><CheckInProgress step={step} /></div>}
          <div className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-mutts-primary animate-fade-in">{title}</h1>
              {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
            </div>
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckInLayout;
