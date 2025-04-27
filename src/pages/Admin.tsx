
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import AttendeeTable from "@/components/AttendeeTable";
import { Attendee } from "@/types/attendee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEventbriteAttendees = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Invoking fetch-eventbrite edge function");
      const response = await supabase.functions.invoke('fetch-eventbrite');
      
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
        }
      }

      await fetchAttendees();
      toast({
        title: "Success",
        description: "Attendees synced with Eventbrite",
      });
    } catch (error) {
      console.error('Error fetching Eventbrite attendees:', error);
      setErrorMessage(error.message || "Failed to fetch Eventbrite attendees");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch Eventbrite attendees",
      });
      
      // Still fetch local attendees even if Eventbrite sync fails
      await fetchAttendees();
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
