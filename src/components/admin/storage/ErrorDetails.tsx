
import { ExternalLink } from "lucide-react";

interface ErrorDetailsProps {
  error: string | null;
  lastAttempt: Date | null;
}

const ErrorDetails = ({ error, lastAttempt }: ErrorDetailsProps) => {
  if (!error) return null;

  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm font-medium text-red-800">Error details:</p>
      <p className="text-xs font-mono mt-1 text-red-700 break-all whitespace-pre-wrap">{error}</p>
      <div className="mt-2">
        <a 
          href="https://supabase.com/dashboard/project/hpjlxjfcfyjjpzbsydue/storage/buckets" 
          target="_blank" 
          className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
        >
          Manage storage in Supabase <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {lastAttempt && (
        <p className="mt-2 text-xs text-gray-500">
          Last configuration attempt: {lastAttempt.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default ErrorDetails;
