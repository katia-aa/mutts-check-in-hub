
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface StatusAlertProps {
  status: 'success' | 'error' | 'idle';
  bucketDetails: any | null;
  detailedError: string | null;
}

const StatusAlert = ({ status, bucketDetails, detailedError }: StatusAlertProps) => {
  if (status === 'success' && bucketDetails) {
    return (
      <Alert className="mt-4 bg-green-50 border-green-200">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Storage is operational</AlertTitle>
        <AlertDescription className="text-green-700">
          Bucket is properly configured and file uploads are working.
          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600">
            <p><strong>Bucket:</strong> {bucketDetails.name}</p>
            <p><strong>Public:</strong> {bucketDetails.public ? "Yes" : "No"}</p>
            <p><strong>Size limit:</strong> {(bucketDetails.file_size_limit / 1024 / 1024).toFixed(1)}MB</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!bucketDetails && status === 'idle') {
    return (
      <Alert className="mt-4 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Storage configuration required</AlertTitle>
        <AlertDescription className="text-amber-700">
          No storage bucket detected. Click "Configure Storage" to create it.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert className="mt-4 bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Storage is not working correctly</AlertTitle>
        <AlertDescription className="text-red-700">
          The storage bucket exists but there are issues with uploads.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default StatusAlert;
