
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { configureStorage } from "@/utils/configureStorage";
import { useToast } from "@/hooks/use-toast";
import { Database, Settings } from "lucide-react";

const StorageConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfigureStorage = async () => {
    setIsConfiguring(true);
    setDetailedError(null);
    
    try {
      console.log("Starting storage configuration process");
      const result = await configureStorage();
      
      if (result.success) {
        console.log("Storage configuration succeeded:", result);
        toast({
          title: "Storage configured",
          description: "Vaccine records storage has been properly configured",
        });
      } else {
        console.error("Configuration error:", result.error);
        setDetailedError(result.error?.message || "Unknown error occurred");
        toast({
          variant: "destructive",
          title: "Configuration error",
          description: "Failed to configure storage. Check console for details.",
        });
      }
    } catch (error) {
      console.error("Error configuring storage:", error);
      setDetailedError(error.message || "Unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during configuration",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Storage Configuration</h3>
        </div>
        <Button 
          onClick={handleConfigureStorage}
          disabled={isConfiguring}
          className="flex items-center gap-2"
        >
          <Settings className={`h-4 w-4 ${isConfiguring ? 'animate-spin' : ''}`} />
          {isConfiguring ? "Configuring..." : "Configure Storage"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        If you're experiencing issues with file uploads, click the button above to ensure proper storage permissions.
      </p>
      
      {detailedError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">Error details:</p>
          <p className="text-xs font-mono mt-1 text-red-700 break-all">{detailedError}</p>
        </div>
      )}
    </div>
  );
};

export default StorageConfig;
