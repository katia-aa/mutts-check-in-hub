
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";

interface ConfigButtonsProps {
  onVerify: () => void;
  onConfigure: () => void;
  isVerifying: boolean;
  isConfiguring: boolean;
}

const ConfigButtons = ({ onVerify, onConfigure, isVerifying, isConfiguring }: ConfigButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        onClick={onVerify}
        disabled={isVerifying || isConfiguring}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
        {isVerifying ? "Checking..." : "Check Status"}
      </Button>
      <Button 
        onClick={onConfigure}
        disabled={isConfiguring}
        className="flex items-center gap-2"
      >
        <Settings className={`h-4 w-4 ${isConfiguring ? 'animate-spin' : ''}`} />
        {isConfiguring ? "Configuring..." : "Configure Storage"}
      </Button>
    </div>
  );
};

export default ConfigButtons;
