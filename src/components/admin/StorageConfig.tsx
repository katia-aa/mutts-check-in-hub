
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { configureStorage } from "@/utils/configureStorage";
import { useToast } from "@/hooks/use-toast";
import { Database, Settings, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

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
      
      // Instead of using protected properties, use Supabase Storage API directly
      try {
        // First approach: Check if we can list buckets
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (!bucketsError) {
          const vaccineBucket = bucketsData?.find(bucket => bucket.name === 'vaccine_records');
          if (vaccineBucket) {
            console.log('Bucket found via listBuckets:', vaccineBucket);
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
      } catch (restError) {
        console.error('Error checking bucket via REST:', restError);
      }
      
      // Fallback to standard Supabase client
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('vaccine_records');
      
      if (bucketError) {
        console.log('Error checking bucket with standard client:', bucketError);
        
        // If we get here and still have an error, the bucket likely doesn't exist
        setBucketDetails(null);
        setDetailedError(`Storage not configured: ${bucketError.message}`);
        setUploadStatus('error');
        return false;
      }
      
      console.log('Bucket details retrieved:', bucketData);
      setBucketDetails(bucketData);
      
      // Now test if we can upload a file
      await testUpload();
      return true;
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
        
        // Wait and then check if the bucket exists after configuration
        await new Promise(resolve => setTimeout(resolve, 5000)); // Longer wait to ensure propagation
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
        This tool configures storage for vaccine records. If uploads are failing, click the "Configure Storage" button.
      </p>
      
      {uploadStatus === 'success' && bucketDetails && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Storage is operational</AlertTitle>
          <AlertDescription className="text-green-700">
            Bucket is properly configured and file uploads are working.
          </AlertDescription>
          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600">
            <p><strong>Bucket:</strong> {bucketDetails.name}</p>
            <p><strong>Public:</strong> {bucketDetails.public ? "Yes" : "No"}</p>
            <p><strong>Size limit:</strong> {(bucketDetails.file_size_limit / 1024 / 1024).toFixed(1)}MB</p>
          </div>
        </Alert>
      )}
      
      {!bucketDetails && !isVerifying && (
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Storage configuration required</AlertTitle>
          <AlertDescription className="text-amber-700">
            No storage bucket detected. Click "Configure Storage" to create it.
          </AlertDescription>
        </Alert>
      )}
      
      {uploadStatus === 'error' && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Storage is not working correctly</AlertTitle>
          <AlertDescription className="text-red-700">
            The storage bucket exists but there are issues with uploads.
          </AlertDescription>
        </Alert>
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
      
      {lastAttempt && (
        <p className="mt-2 text-xs text-gray-500">
          Last configuration attempt: {lastAttempt.toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
};

export default StorageConfig;
