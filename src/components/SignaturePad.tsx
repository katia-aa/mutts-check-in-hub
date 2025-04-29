
import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignaturePadProps {
  onSignatureSubmit?: () => void;
}

type SignatureCanvasRef = SignatureCanvas;

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureSubmit }) => {
  const [signature, setSignature] = useState<string | null>(null);
  const sigCanvasRef = useRef<SignatureCanvasRef | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();

  const email = new URLSearchParams(location.search).get('email');
  const noDog = new URLSearchParams(location.search).get('noDog') === 'true';

  useEffect(() => {
    if (!email) {
      toast.error({
        title: "Missing Email",
        description: "Email parameter is missing. Please go back and try again.",
      });
      // Redirect to the home page or an error page
      navigate('/');
    }
  }, [email, navigate, toast]);

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignature(null);
    }
  };

  const saveSignature = () => {
    if (!sigCanvasRef.current) return;

    const signatureDataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    setSignature(signatureDataUrl);
  };

  const handleSubmit = async () => {
    if (!signature) {
      toast.error({
        title: "No Signature",
        description: "Please provide your signature before submitting.",
      });
      return;
    }

    if (!email) {
      toast.error({
        title: "Missing Email",
        description: "Email parameter is missing. Please go back and try again.",
      });
      return;
    }

    try {
      // Upload the signature to Supabase storage
      const imageName = `signatures/${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      const block = signature.split(";base64,").pop();
      const buff = Buffer.from(block as string, 'base64');

      const { data, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(imageName, buff, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error("Error uploading signature:", uploadError);
        toast.error({
          title: "Upload Error",
          description: "Failed to upload signature. Please try again.",
        });
        return;
      }

      const publicURL = supabase.storage.from('signatures').getPublicUrl(imageName);

      // Update the attendee record with the signature URL
      const { error: updateError } = await supabase
        .from('attendees')
        .update({
          signature_svg: publicURL.data.publicUrl,
          signed_waiver_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error("Error updating attendee record:", updateError);
        toast.error({
          title: "Database Error",
          description: "Failed to save signature URL. Please try again.",
        });
        return;
      }

      toast.success({
        title: "Waiver Signed!",
        description: "Thank you for signing the waiver!",
      });

      // If attendee has no dog, skip the vaccine upload step
      if (noDog) {
        navigate(`/`);
      } else {
        navigate(`/upload-vaccine?email=${encodeURIComponent(email as string)}`);
      }

      if (onSignatureSubmit) {
        onSignatureSubmit();
      }

    } catch (error) {
      console.error("Error during submission:", error);
      toast.error({
        title: "Submission Error",
        description: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative border rounded-md">
        <SignatureCanvas
          ref={sigCanvasRef}
          canvasProps={{
            width: 500,
            height: 200,
            className: 'w-full h-full',
            style: {
              backgroundColor: 'rgba(0,0,0,0)',
            }
          }}
          backgroundColor="rgba(0,0,0,0)"
          penColor="black"
        />
        <div className="absolute top-2 right-2 space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={saveSignature}>
            Save
          </Button>
        </div>
      </div>

      <Button 
        className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
        onClick={handleSubmit}
        disabled={!signature}
      >
        <Check className="w-5 h-5 mr-2" />
        I Pawtographed!
      </Button>
    </div>
  );
};

export default SignaturePad;
