
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import CheckInLayout from "@/components/CheckInLayout";
import SignaturePad from "@/components/SignaturePad";

const SignWaiver = () => {
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');
  const noDog = new URLSearchParams(location.search).get('noDog') === 'true';

  return (
    <CheckInLayout step={2} title="Sign Our Waiver" subtitle="Just a quick paw-thentication!">
      <div className="space-y-6">
        <Card className="border-none card-shadow rounded-xl bg-white/90 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-medium">By signing below, I acknowledge that:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>I am responsible for my dog's behavior at all times.</li>
                <li>My dog is up-to-date on all required vaccinations.</li>
                <li>I will clean up after my dog and dispose of waste properly.</li>
                <li>I assume all risks related to my participation in this event.</li>
                <li>I release the event organizers from liability for any incidents.</li>
              </ul>
              <p>I have read and understood the above waiver and agree to these terms.</p>
            </div>

            {/* SignaturePad component with navigation logic that checks noDog */}
            <SignaturePad />
          </div>
        </Card>
      </div>
    </CheckInLayout>
  );
};

export default SignWaiver;
