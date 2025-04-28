
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { configureStorage } from "@/utils/configureStorage";
import { useToast } from "@/hooks/use-toast";
import { Database, Settings, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StorageConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<any>(null);
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check bucket status on component mount
    verifyBucket();
  }, []);

  const verifyBucket = async () => {
    setIsVerifying(true);
    setDetailedError(null);
    
    try {
      console.log('Verifying bucket existence...');
      
      // Test file upload permission
      try {
        // Create a small test blob
        const testBlob = new Blob(['test'], { type: 'image/png' });
        const fileName = `test-${Date.now()}.png`;
        
        // Try to upload a test file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vaccine_records')
          .upload(fileName, testBlob, { upsert: true });
          
        if (uploadError) {
          console.error("Error uploading test file:", uploadError);
          throw uploadError;
        } else {
          console.log("Test upload successful:", uploadData);
          
          // Clean up test file
          const { error: deleteError } = await supabase.storage
            .from('vaccine_records')
            .remove([fileName]);
          
          if (deleteError) {
            console.warn("Could not delete test file:", deleteError);
          }
          
          setBucketDetails({
            name: 'vaccine_records',
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
          });
          
          return true;
        }
      } catch (uploadTestError) {
        console.error("Upload test failed:", uploadTestError);
        
        // If upload test fails, try to get bucket details
        const { data, error } = await supabase.storage.getBucket('vaccine_records');
        
        if (error) {
          console.log('Error checking bucket:', error);
          setBucketDetails(null);
          setDetailedError(`Storage not configured: ${error.message}`);
          return false;
        }
        
        console.log('Bucket details:', data);
        setBucketDetails(data);
        setDetailedError("Bucket exists but upload test failed. You may need to reconfigure.");
        return false;
      }
    } catch (error: any) {
      console.error('Exception checking bucket:', error);
      setDetailedError(`Exception verifying storage: ${error.message}`);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfigureStorage = async () => {
    setIsConfiguring(true);
    setDetailedError(null);
    setLastAttempt(new Date());
    
    try {
      console.log("Starting storage configuration process");
      const result = await configureStorage();
      
      if (result.success) {
        console.log("Storage configuration succeeded:", result);
        
        // Wait and then check if the bucket exists after configuration
        await new Promise(resolve => setTimeout(resolve, 3000));
        const bucketExists = await verifyBucket();
        
        toast({
          title: "Storage configured",
          description: bucketExists 
            ? "Vaccine records storage has been properly configured" 
            : "Configuration completed, but bucket permissions may need adjustment",
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
    } catch (error: any) {
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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={verifyBucket}
            disabled={isVerifying || isConfiguring}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? "Checking..." : "Check Status"}
          </Button>
          <Button 
            onClick={handleConfigureStorage}
            disabled={isConfiguring}
            className="flex items-center gap-2"
          >
            <Settings className={`h-4 w-4 ${isConfiguring ? 'animate-spin' : ''}`} />
            {isConfiguring ? "Configuring..." : "Configure Storage"}
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        If you're experiencing issues with file uploads, click the "Configure Storage" button to ensure proper storage permissions.
      </p>
      
      {!bucketDetails && !isVerifying && (
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            No storage bucket detected. Click "Configure Storage" to create it.
          </AlertDescription>
        </Alert>
      )}
      
      {bucketDetails && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-800">Bucket detected:</p>
          <ul className="mt-1 text-xs text-blue-700">
            <li>Name: {bucketDetails.name}</li>
            <li>Public: {bucketDetails.public ? "Yes" : "No"}</li>
            <li>File size limit: {(bucketDetails.fileSizeLimit / 1024 / 1024).toFixed(1)}MB</li>
            {lastAttempt && (
              <li>Last configuration attempt: {lastAttempt.toLocaleTimeString()}</li>
            )}
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
