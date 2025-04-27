
import { ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface ErrorDisplayProps {
  errorMessage: string | null;
  connectionError: boolean;
  rlsError: boolean;
}

const ErrorDisplay = ({ errorMessage, connectionError, rlsError }: ErrorDisplayProps) => {
  if (!errorMessage) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{errorMessage}</p>
          {connectionError && (
            <div className="mt-2">
              <p className="text-sm mb-2">Troubleshooting steps:</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Check if your connection to the internet is stable</li>
                <li>Verify that the Supabase project is online</li>
                <li>Check if the edge function has been deployed correctly</li>
                <li>Try refreshing the page and syncing again</li>
              </ul>
            </div>
          )}
          {rlsError && (
            <div className="mt-2">
              <p className="text-sm mb-2">This is a Row Level Security (RLS) policy issue. To fix it:</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Run the following SQL to disable RLS on the attendees table:</li>
                <code className="block bg-gray-800 text-white p-2 text-sm rounded mt-1 mb-2">
                  ALTER TABLE public.attendees DISABLE ROW LEVEL SECURITY;
                </code>
                <li>Or, create a RLS policy that allows the edge function to insert data:
                  <code className="block bg-gray-800 text-white p-2 text-sm rounded mt-1 mb-2">
                    {`CREATE POLICY "Allow service role inserts" ON public.attendees FOR INSERT TO service_role USING (true);`}
                  </code>
                </li>
                <li>After updating the RLS settings, try syncing again</li>
              </ul>
              <div className="mt-2">
                <Link to="https://supabase.com/dashboard/project/hpjlxjfcfyjjpzbsydue/editor" target="_blank" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  Open SQL Editor <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
