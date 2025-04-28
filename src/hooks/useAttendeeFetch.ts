
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Attendee } from "@/types/attendee";

export const useAttendeeFetch = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAttendees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("attendees").select("*");
      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error("Error fetching attendees from Supabase:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch attendees from database",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    attendees,
    isLoading,
    fetchAttendees,
  };
};
