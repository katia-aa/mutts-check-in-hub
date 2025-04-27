
import { useRef, useEffect, useState } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignaturePad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePadLib(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "#8C81BD",
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
        title: "Paw print needed!",
        description: "Please sign the waiver before proceeding",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Save signature data and proceed to next step
    const signatureData = signaturePadRef.current?.toDataURL();
    console.log("Signature data:", signatureData);
    
    setTimeout(() => {
      toast({
        title: "Great job!",
        description: "Your signature has been saved. Moving to the next step!",
      });
      navigate('/upload-vaccine');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="border border-mutts-primary/30 rounded-xl overflow-hidden bg-white/90 shadow-sm">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "180px" }}
        />
      </div>
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleClear}
          className="w-2/5 border-mutts-primary/30 hover:border-mutts-primary/50 text-mutts-primary rounded-xl"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button
          onClick={handleNext}
          className="w-3/5 bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Next Step"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-center text-gray-500">
        By signing, you agree to our event rules and waiver terms.
      </p>
    </div>
  );
};

export default SignaturePad;
