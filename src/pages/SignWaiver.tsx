
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SignaturePad from "@/components/SignaturePad";
import CheckInLayout from "@/components/CheckInLayout";

const SignWaiver = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isGuest = searchParams.get("isGuest") === "true";
  const noDog = searchParams.get("noDog") === "true";
  
  // Determine if we're using the 2-step or 3-step flow
  const isShortFlow = isGuest || noDog;
  const totalSteps = isShortFlow ? 2 : 3;
  
  // Check for required parameters
  useEffect(() => {
    const email = searchParams.get("email");
    if (!email && !isGuest) {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <CheckInLayout
      step={2}
      title="Sign the Waiver"
      subtitle="Please sign below to acknowledge the waiver"
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-mutts-primary/30 p-4 bg-white/90 shadow-sm h-[30vh] overflow-auto">
          <h3 className="text-lg font-semibold text-mutts-primary mb-3">
            Mutts in the 6ix Event Waiver
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              By signing this waiver, I acknowledge that I understand the inherent
              risks of attending an event with dogs present, including but not
              limited to potential injuries from dog interactions.
            </p>
            <p>
              I assume full responsibility for myself, any minors under my care, and
              any dogs I bring to the event. I release the event organizers, venue,
              and all associated parties from any liability for injuries, damages, or
              losses that may occur during the event.
            </p>
            <p>
              I confirm that any dog I bring is up-to-date on vaccinations, is not
              aggressive toward people or other dogs, and will remain under my
              control at all times.
            </p>
            <p>
              I grant permission for photos or videos taken of me or my dog during
              the event to be used for promotional purposes without compensation.
            </p>
          </div>
        </div>

        <SignaturePad />
      </div>
    </CheckInLayout>
  );
};

export default SignWaiver;
