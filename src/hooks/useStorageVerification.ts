
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { configureStorage } from "@/utils/configureStorage";

interface UseStorageVerificationReturn {
  isConfiguring: boolean;
  isVerifying: boolean;
  detailedError: string | null;
  bucketDetails: any | null;
  uploadStatus: 'success' | 'error' | 'idle';
  lastAttempt: Date | null;
  verifyBucket: () => Promise<boolean>;
  handleConfigureStorage: () => Promise<void>;
}

export const useStorageVerification = (): UseStorageVerificationReturn => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [bucketDetails, setBucketDetails] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const { toast } = useToast();

  const testUpload = async () => {
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;
      
      console.log('Attempting test upload to verify permissions...');
      
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
      }

      console.log("Test upload successful:", uploadData);
      
      await supabase.storage
        .from('vaccine_records')
        .remove([fileName]);
      
      setUploadStatus('success');
      return true;
    } catch (uploadTestError: any) {
      console.error("Upload test failed:", uploadTestError);
      setDetailedError(`Bucket exists but upload test failed: ${uploadTestError.message}`);
      setUploadStatus('error');
      return false;
    }
  };

  const verifyBucket = async () => {
    setIsVerifying(true);
    setDetailedError(null);
    setUploadStatus('idle');
    
    try {
      console.log('Verifying bucket existence...');
      
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError) {
        console.log('Bucket list retrieved:', bucketsData);
        const vaccineBucket = bucketsData?.find(bucket => bucket.name === 'vaccine_records');
        if (vaccineBucket) {
          console.log('Bucket found in list:', vaccineBucket);
          setBucketDetails(vaccineBucket);
          
          await testUpload();
          return true;
        }
        console.log('Bucket not found in list');
      } else {
        console.log('Error listing buckets:', bucketsError);
      }
      
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

  return {
    isConfiguring,
    isVerifying,
    detailedError,
    bucketDetails,
    uploadStatus,
    lastAttempt,
    verifyBucket,
    handleConfigureStorage
  };
};
