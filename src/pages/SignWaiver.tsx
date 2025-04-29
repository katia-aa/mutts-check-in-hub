import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CheckInLayout from "@/components/CheckInLayout";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { supabase } from "@/integrations/supabase/client";
import SignaturePad from "@/components/SignaturePad";
import { Card } from "@/components/ui/card";

const SignWaiver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useCustomToast();

  const email = new URLSearchParams(location.search).get('email');

  return (
    <CheckInLayout step={2} title="Sign Our Waiver" subtitle="Just a quick paw-thentication!">
      <div className="space-y-6">
        <Card className="border-none card-shadow rounded-xl bg-white/90 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <p className="text-gray-600">
              Please sign below to acknowledge that you have read and agree to our event waiver.
            </p>

            {/* Use the existing SignaturePad component instead */}
            <SignaturePad />
          </div>
        </Card>
      </div>
    </CheckInLayout>
  );
};

export default SignWaiver;
