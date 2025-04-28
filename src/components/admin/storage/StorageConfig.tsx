
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { configureStorage } from "@/utils/configureStorage";
import { supabase } from "@/integrations/supabase/client";
import StatusAlert from "./StatusAlert";
import ErrorDetails from "./ErrorDetails";
import ConfigButtons from "./ConfigButtons";

const StorageConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check bucket status on component mount
    verifyBucket();
  }, []);

  const verifyBucket = async () => {
    setIsVerifying(true);
    setDetailedError(null);
    setUploadStatus('idle');
    
    try {
      console.log('Verifying bucket existence...');
      
      // First approach: Check if we can list buckets
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError) {
        console.log('Bucket list retrieved:', bucketsData);
        const vaccineBucket = bucketsData?.find(bucket => bucket.name === 'vaccine_records');
        if (vaccineBucket) {
          console.log('Bucket found in list:', vaccineBucket);
          setBucketDetails(vaccineBucket);
          
          // Now test if we can upload a file to validate permissions
          await testUpload();
          return true;
        } else {
          console.log('Bucket not found in list');
        }
      } else {
        console.log('Error listing buckets:', bucketsError);
      }
      
      // Fallback to direct bucket check
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('vaccine_records');
        
        if (bucketError) {
          console.log('Error checking bucket directly:', bucketError);
          setBucketDetails(null);
          setDetailedError(`Storage not configured: ${bucketError.message}`);
          setUploadStatus('error');
          return false;
        }
        
        console.log('Bucket details retrieved directly:', bucketData);
        setBucketDetails(bucketData);
        
        // Now test if we can upload a file
        await testUpload();
        return true;
      } catch (bucketCheckError) {
        console.error('Error during bucket check:', bucketCheckError);
        setDetailedError(`Error checking bucket: ${bucketCheckError instanceof Error ? bucketCheckError.message : String(bucketCheckError)}`);
        setUploadStatus('error');
        return false;
      }
    } catch (error: any) {
      console.error('Exception verifying storage:', error);
      setDetailedError(`Exception verifying storage: ${error.message}`);
      setUploadStatus('error');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const testUpload = async () => {
    try {
      // Create a small test blob
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;
      
      console.log('Attempting test upload to verify permissions...');
      
      // Try to upload a test file with the correct content type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vaccine_records')
        .upload(fileName, testBlob, { 
          contentType: 'text/plain',
          upsert: true 
        });
        
      if (uploadError) {
        console.error("Error uploading test file:", uploadError);
        setDetailedError(`Bucket exists but upload failed: ${uploadError.message}`);
        setUploadStatus('error');
        return false;
      } else {
        console.log("Test upload successful:", uploadData);
        
        // Clean up test file
        await supabase.storage
          .from('vaccine_records')
          .remove([fileName]);
        
        setUploadStatus('success');
        return true;
      }
    } catch (uploadTestError: any) {
      console.error("Upload test failed:", uploadTestError);
      setDetailedError(`Bucket exists but upload test failed: ${uploadTestError.message}`);
      setUploadStatus('error');
      return false;
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
        
        toast({
          title: "Storage configuration in progress",
          description: "Please wait while we verify the configuration..."
        });
        
        // Wait 8 seconds for propagation of the changes
        await new Promise(resolve => setTimeout(resolve, 8000)); 
        
        const bucketVerified = await verifyBucket();
        
        toast({
          title: "Storage configuration completed",
          description: bucketVerified 
            ? "Vaccine records storage has been properly configured" 
            : "Configuration completed, but verification found issues",
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
    <Card className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Storage Configuration</h3>
        </div>
        <ConfigButtons 
          onVerify={verifyBucket}
          onConfigure={handleConfigureStorage}
          isVerifying={isVerifying}
          isConfiguring={isConfiguring}
        />
      </div>
      
      <p className="mt-2 text-sm text-gray-600">
        This tool configures storage for vaccine records. If uploads are failing, click the "Configure Storage" button.
      </p>
      
      <StatusAlert 
        status={uploadStatus}
        bucketDetails={bucketDetails}
        detailedError={detailedError}
      />
      
      <ErrorDetails 
        error={detailedError}
        lastAttempt={lastAttempt}
      />
    </Card>
  );
};

export default StorageConfig;
