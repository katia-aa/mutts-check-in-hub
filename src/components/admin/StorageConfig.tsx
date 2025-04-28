
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { configureStorage } from "@/utils/configureStorage";
import { useToast } from "@/hooks/use-toast";
import { Database, Settings } from "lucide-react";

const StorageConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  const handleConfigureStorage = async () => {
    setIsConfiguring(true);
    try {
      const result = await configureStorage();
      if (result.success) {
        toast({
          title: "Storage configured",
          description: "Vaccine records storage has been properly configured",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Configuration error",
          description: "Failed to configure storage. Check console for details.",
        });
      }
    } catch (error) {
      console.error("Error configuring storage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
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
          <Settings className="h-4 w-4" />
          {isConfiguring ? "Configuring..." : "Configure Storage"}
        </Button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        If you're experiencing issues with file uploads, click the button above to ensure proper storage permissions.
      </p>
    </div>
  );
};

export default StorageConfig;
