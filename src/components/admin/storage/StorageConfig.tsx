
import { useEffect } from "react";
import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStorageVerification } from "@/hooks/useStorageVerification";
import StatusAlert from "./StatusAlert";
import ErrorDetails from "./ErrorDetails";
import ConfigButtons from "./ConfigButtons";

const StorageConfig = () => {
  const {
    isConfiguring,
    isVerifying,
    detailedError,
    bucketDetails,
    uploadStatus,
    lastAttempt,
    verifyBucket,
    handleConfigureStorage
  } = useStorageVerification();

  useEffect(() => {
    verifyBucket();
  }, []);

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
