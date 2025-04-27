
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import AttendeeTable from "@/components/AttendeeTable";
import { Attendee } from "@/types/attendee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [rlsError, setRlsError] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchEventbriteAttendees = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setConnectionError(false);
    setRlsError(false);
    
    try {
      console.log("Invoking fetch-eventbrite edge function");
      
      // Add timeout to detect connection issues
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout: Could not reach the edge function")), 10000);
      });
      
      const responsePromise = supabase.functions.invoke('fetch-eventbrite');
      
      // Race between the actual request and the timeout
      const response: any = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log("Edge function response:", response);
      
      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(`Function error: ${response.error.message}`);
      }

      // Check if there's an error message in the response data
      if (response.data?.error) {
        console.error("Edge function returned error:", response.data.error);
        throw new Error(response.data.error);
      }

      // The API might return successfully but with no attendees data
      const eventbriteAttendees = response.data?.attendees || [];
      console.log('Fetched Eventbrite attendees:', eventbriteAttendees);

      if (eventbriteAttendees.length === 0) {
        console.warn("No attendees found in Eventbrite response");
      }

      // Check if there's an RLS error message in the response data
      if (response.data?.rlsError) {
        console.error("RLS error:", response.data.rlsError);
        setRlsError(true);
        setErrorMessage("Row Level Security policy violation: The database is preventing the edge function from inserting attendee data.");
        // Still fetch local attendees even if there's an RLS error
        await fetchAttendees();
        return;
      }

      // Sync Eventbrite attendees with Supabase
      for (const attendee of eventbriteAttendees) {
        if (!attendee.profile || !attendee.profile.email) {
          console.warn("Skipping attendee without email:", attendee);
          continue;
        }

        const { error } = await supabase
          .from('attendees')
          .upsert({
            email: attendee.profile.email,
            name: `${attendee.profile.first_name} ${attendee.profile.last_name}`,
            eventbrite_id: attendee.id,
            document_upload_status: false,
            vaccine_upload_status: false
          }, {
            onConflict: 'email'
          });

        if (error) {
          console.error('Error syncing attendee:', error);
          if (error.code === "42501" || error.message?.includes("row-level security")) {
            setRlsError(true);
            setErrorMessage("Row Level Security policy violation: The database is preventing insertion of attendee data.");
            break;
          }
        }
      }

      await fetchAttendees();
      toast({
        title: "Success",
        description: "Attendees synced with Eventbrite",
      });
    } catch (error) {
      console.error('Error fetching Eventbrite attendees:', error);
      
      if (error.message?.includes("timeout") || error.message?.includes("Failed to fetch")) {
        setConnectionError(true);
        setErrorMessage("Connection issue: Could not reach the edge function. This might be a network problem or the function might be offline.");
      } else if (error.code === "42501" || error.message?.includes("row-level security")) {
        setRlsError(true);
        setErrorMessage("Row Level Security policy violation: The database is preventing insertion of attendee data.");
      } else {
        // Check if the error is related to API key configuration
        const errorMsg = error.message || "Failed to fetch Eventbrite attendees";
        setErrorMessage(errorMsg);
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message?.includes("API key") 
          ? "API key configuration error. Please check your Eventbrite API key in Supabase secrets."
          : error.message?.includes("timeout") || error.message?.includes("Failed to fetch")
            ? "Connection issue with the edge function"
            : error.code === "42501" || error.message?.includes("row-level security")
              ? "Row Level Security policy violation"
              : "Failed to fetch Eventbrite attendees",
      });
      
      // Still fetch local attendees even if Eventbrite sync fails
      await fetchAttendees();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*');

      if (error) throw error;

      setAttendees(data || []);
    } catch (error) {
      console.error('Error fetching attendees from Supabase:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch attendees from database",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventbriteAttendees();
  }, []);

  const filteredData = attendees.filter(
    attendee =>
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attendee.name && attendee.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-mutts-primary">Admin Check-In Dashboard</h1>
          <Button 
            onClick={fetchEventbriteAttendees}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Syncing..." : "Sync Eventbrite"}
          </Button>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>{errorMessage}</p>
                {connectionError ? (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Troubleshooting steps:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Check if your connection to the internet is stable</li>
                      <li>Verify that the Supabase project is online</li>
                      <li>Check if the edge function has been deployed correctly</li>
                      <li>Try refreshing the page and syncing again</li>
                    </ul>
                  </div>
                ) : rlsError ? (
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
                ) : errorMessage.includes("API key") && (
                  <p className="text-sm">
                    This appears to be an API key configuration issue. Please make sure the EVENTBRITE_API_KEY is correctly set in your Supabase project.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-md border-mutts-primary/20 focus:border-mutts-primary"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-500">Loading attendees...</p>
          </div>
        ) : (
          <>
            {filteredData.length > 0 ? (
              <AttendeeTable data={filteredData} onDataUpdate={fetchAttendees} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No matching attendees found" : "No attendees found"}
                {errorMessage && (
                  <div className="mt-4">
                    <p className="mb-2">Please check your connection and API configuration.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
