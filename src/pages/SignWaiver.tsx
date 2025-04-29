import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignatureCanvas from 'react-signature-canvas';
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { supabase } from "@/integrations/supabase/client";

const SignWaiver = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const email = new URLSearchParams(location.search).get('email');

  const handleBeginSign = () => {
    setIsSigning(true);
  };

  const handleEndSign = () => {
    setIsSigning(false);
  };

  const handleSave = async () => {
    if (!sigCanvasRef.current) {
      toast.error({
        title: "Could not save signature",
        description: "Please try again.",
      });
      return;
    }

    const trimmedSig = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/svg+xml');

    if (!trimmedSig || trimmedSig === 'data:,') {
      toast.error({
        title: "No signature detected",
        description: "Please sign the waiver before saving.",
      });
      return;
    }

    setSignature(trimmedSig);
    setIsSigning(false);

    try {
      if (!email) {
        toast.error({
          title: "Email Missing",
          description: "Email parameter is missing. Please try again.",
        });
        return;
      }

      const { error } = await supabase
        .from('attendees')
        .update({ signature_svg: trimmedSig })
        .eq('email', email);

      if (error) {
        console.error('Error updating signature:', error);
        toast.error({
          title: "Error Saving Signature",
          description: "Failed to save signature. Please try again.",
        });
        return;
      }

      toast.success({
        title: "Signature Saved",
        description: "Your signature has been successfully saved.",
      });

      // Inside the component where navigation happens - look for the navigation after waiver signing
      // and modify it to check for the noDog parameter in the URL

      // Add this code where appropriate after the waiver is signed:
      const urlParams = new URLSearchParams(location.search);
      const noDog = urlParams.get('noDog') === 'true';

      // Then modify the navigation logic:
      if (noDog) {
        navigate(`/check-in-complete?email=${encodeURIComponent(email)}`);
      } else {
        navigate(`/upload-vaccine?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error({
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    }
  };

  const handleClear = () => {
    if (!sigCanvasRef.current) return;
    sigCanvasRef.current.clear();
    setSignature(null);
  };

  return (
    <CheckInLayout step={2} title="Sign Our Waiver" subtitle="Just a quick paw-thentication!">
      <div className="space-y-6">
        <Card className="border-none card-shadow rounded-xl bg-white/90 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <p className="text-gray-600">
              Please sign below to acknowledge that you have read and agree to our event waiver.
            </p>

            <div className="relative">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                backgroundColor="rgba(0,0,0,0)"
                onBegin={handleBeginSign}
                onEnd={handleEndSign}
                canvasProps={{ className: 'w-full h-48 border border-gray-300 rounded-md' }}
              />
              {isSigning && (
                <div className="absolute inset-0 bg-gray-50 opacity-20 pointer-events-none rounded-md" />
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSigning}>
                Save Signature
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </CheckInLayout>
  );
};

export default SignWaiver;

import { Card } from "@/components/ui/card"
