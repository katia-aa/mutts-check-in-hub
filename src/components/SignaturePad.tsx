import { useRef, useEffect } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignaturePad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePadLib(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
      });
      
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetWidth * 0.5 * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          signaturePadRef.current?.clear();
        }
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
  };

  const handleNext = () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast({
        variant: "destructive",
        title: "Signature required",
        description: "Please provide a signature before proceeding",
      });
      return;
    }
    // Save signature data and proceed to next step
    const signatureData = signaturePadRef.current?.toDataURL();
    console.log("Signature data:", signatureData);
    
    toast({
      title: "Signature saved",
      description: "Proceeding to vaccine record upload",
    });
    navigate('/upload-vaccine');
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "200px" }}
        />
      </div>
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleClear}
          className="w-full"
        >
          <X className="mr-2" />
          Clear Signature
        </Button>
        <Button
          onClick={handleNext}
          className="w-full bg-teal-500 hover:bg-teal-600"
        >
          Next Step
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
