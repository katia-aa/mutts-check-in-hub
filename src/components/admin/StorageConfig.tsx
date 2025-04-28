
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { configureStorage } from "@/utils/configureStorage";
import { useToast } from "@/hooks/use-toast";
import { Database, Settings, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StorageConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<any>(null);
  const { toast } = useToast();

  const checkBucketExists = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('vaccine_records');
      if (error) {
        console.log('Error checking bucket:', error);
        return false;
      }
      console.log('Bucket details:', data);
      setBucketDetails(data);
      return true;
    } catch (error) {
      console.error('Exception checking bucket:', error);
      return false;
    }
  };

  const handleConfigureStorage = async () => {
    setIsConfiguring(true);
    setDetailedError(null);
    
    try {
      console.log("Starting storage configuration process");
      const result = await configureStorage();
      
      if (result.success) {
        console.log("Storage configuration succeeded:", result);
        
        // Check if the bucket exists after configuration
        const bucketExists = await checkBucketExists();
        
        toast({
          title: "Storage configured",
          description: bucketExists 
            ? "Vaccine records storage has been properly configured" 
            : "Configuration succeeded, but the bucket may need manual verification",
        });
      } else {
        console.error("Configuration error:", result.error);
        setDetailedError(JSON.stringify(result.error, null, 2) || "Unknown error occurred");
        toast({
          variant: "destructive",
          title: "Configuration error",
          description: "Failed to configure storage. Check details below.",
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
      
      {bucketDetails && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-800">Bucket status:</p>
          <ul className="mt-1 text-xs text-blue-700">
            <li>Name: {bucketDetails.name}</li>
            <li>Public: {bucketDetails.public ? "Yes" : "No"}</li>
            <li>File size limit: {(bucketDetails.fileSizeLimit / 1024 / 1024).toFixed(1)}MB</li>
          </ul>
        </div>
      )}
      
      {detailedError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">Error details:</p>
          <p className="text-xs font-mono mt-1 text-red-700 break-all whitespace-pre-wrap">{detailedError}</p>
          <div className="mt-2">
            <a 
              href="https://supabase.com/dashboard/project/hpjlxjfcfyjjpzbsydue/storage/buckets" 
              target="_blank" 
              className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
            >
              Manage storage in Supabase <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageConfig;
