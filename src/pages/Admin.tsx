import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Attendee } from "@/types/attendee";
import AdminHeader from "@/components/admin/AdminHeader";
import ErrorDisplay from "@/components/admin/ErrorDisplay";
import SearchBar from "@/components/admin/SearchBar";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AttendeeTable from "@/components/AttendeeTable";

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
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout: Could not reach the edge function")), 10000);
      });
      
      const responsePromise = supabase.functions.invoke('fetch-eventbrite');
      
      const response: any = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log("Edge function response:", response);
      
      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(`Function error: ${response.error.message}`);
      }

      if (response.data?.error) {
        console.error("Edge function returned error:", response.data.error);
        throw new Error(response.data.error);
      }

      const eventbriteAttendees = response.data?.attendees || [];
      console.log('Fetched Eventbrite attendees:', eventbriteAttendees);

      if (eventbriteAttendees.length === 0) {
        console.warn("No attendees found in Eventbrite response");
      }

      if (response.data?.rlsError) {
        console.error("RLS error:", response.data.rlsError);
        setRlsError(true);
        setErrorMessage("Row Level Security policy violation: The database is preventing the edge function from inserting attendee data.");
        await fetchAttendees();
        return;
      }

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
            signature_status: false,
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
        <AdminHeader onSync={fetchEventbriteAttendees} isLoading={isLoading} />
        
        <ErrorDisplay 
          errorMessage={errorMessage}
          connectionError={connectionError}
          rlsError={rlsError}
        />
        
        <SearchBar 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {filteredData.length > 0 ? (
              <AttendeeTable data={filteredData} onDataUpdate={fetchAttendees} />
            ) : (
              <EmptyState searchTerm={searchTerm} errorMessage={errorMessage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
