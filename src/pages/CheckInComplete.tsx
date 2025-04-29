
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import CheckInLayout from "@/components/CheckInLayout";
import Confetti from "@/components/Confetti";

const CheckInComplete = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("isGuest") === "true";
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Show confetti when component mounts
    setShowConfetti(true);
    
    // Scroll to top for best confetti effect
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <CheckInLayout
        step={isGuest ? 2 : 3}
        title="Check-in Complete!"
        subtitle="You're all set for the event"
        showProgress={false}
        totalSteps={isGuest ? 2 : 3}
      >
        <div className="space-y-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 p-4">
            <div className="rounded-full bg-green-100 p-3 animate-scale-in">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-mutts-primary">
              You're all set!
            </h2>
            
            <p className="text-gray-600 max-w-md">
              Thank you for completing your check-in. We can't wait to see you and your furry friend at the event!
            </p>

            <div className="bg-mutts-primary/10 rounded-lg p-4 w-full max-w-md">
              <p className="font-medium text-mutts-primary">Completed Steps:</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Information provided
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Waiver signed
                </li>
                {!isGuest && (
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Vaccine record uploaded
                  </li>
                )}
              </ul>
            </div>
          </div>

          <Button
            asChild
            className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
          >
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </CheckInLayout>
    </>
  );
};

export default CheckInComplete;
